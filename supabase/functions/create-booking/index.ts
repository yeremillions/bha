
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * SHARED CORS LOGIC
 */
const ALLOWED_ORIGINS = [
  "https://brooklynhillsapartment.com",
  "https://www.brooklynhillsapartment.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}

/**
 * SHARED RATE LIMIT LOGIC
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

function checkRateLimit(
  req: Request,
  corsHeaders: Record<string, string>,
  config: RateLimitConfig = DEFAULT_CONFIG
): Response | null {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const url = new URL(req.url);
  const key = `${clientIp}:${url.pathname}`;

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}

/**
 * SHARED AUDIT LOG LOGIC
 */
async function writeAuditLog(
  supabaseAdmin: SupabaseClient,
  entry: {
    action: string;
    userId?: string;
    userEmail?: string;
    details?: string;
  }
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      action: entry.action,
      user_id: entry.userId || null,
      user_email: entry.userEmail || null,
      details: entry.details || null,
    });
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}

/**
 * MAIN FUNCTION LOGIC
 */

interface CreateBookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  pricing: {
    baseAmount: number;
    cleaningFee: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  };
}

async function calculateExpectedPricing(
  supabase: any,
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
  numGuests: number,
  discountAmount: number
): Promise<{ baseAmount: number; cleaningFee: number; taxAmount: number; totalAmount: number; nights: number } | null> {
  const { data: property, error } = await supabase
    .from("properties")
    .select("base_price_per_night, cleaning_fee, max_guests")
    .eq("id", propertyId)
    .single();

  if (error || !property) {
    return null;
  }

  if (numGuests > property.max_guests) {
    throw new Error(`Maximum ${property.max_guests} guests allowed for this property`);
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new Error("Check-out date must be after check-in date");
  }

  const baseAmount = property.base_price_per_night * nights;
  const cleaningFee = property.cleaning_fee || 0;
  const subtotal = baseAmount + cleaningFee - discountAmount;

  const taxAmount = Math.round(subtotal * 0.075);
  const totalAmount = subtotal + taxAmount;

  return {
    baseAmount,
    cleaningFee,
    taxAmount,
    totalAmount,
    nights,
  };
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const rateLimited = checkRateLimit(req, getCorsHeaders(req), { maxRequests: 5, windowSeconds: 60 });
  if (rateLimited) return rateLimited;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateBookingRequest = await req.json();
    console.log('Received booking request body:', JSON.stringify(body, null, 2));
    const { propertyId, checkInDate, checkOutDate, numGuests, guestInfo, pricing } = body;

    if (!propertyId || typeof propertyId !== 'string') {
      console.error("Invalid property ID:", propertyId);
      return new Response(
        JSON.stringify({ error: "Invalid property ID" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!checkInDate || !isValidDate(checkInDate)) {
      console.error("Invalid check-in date:", checkInDate);
      return new Response(
        JSON.stringify({ error: "Invalid check-in date" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!checkOutDate || !isValidDate(checkOutDate)) {
      console.error("Invalid check-out date:", checkOutDate);
      return new Response(
        JSON.stringify({ error: "Invalid check-out date" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!guestInfo?.email || !isValidEmail(guestInfo.email)) {
      console.error("Invalid email:", guestInfo?.email);
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!guestInfo?.fullName || guestInfo.fullName.trim().length < 2) {
      console.error("Invalid full name:", guestInfo?.fullName);
      return new Response(
        JSON.stringify({ error: "Full name is required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!numGuests || numGuests < 1 || numGuests > 50) {
      console.error("Invalid number of guests:", numGuests);
      return new Response(
        JSON.stringify({ error: "Invalid number of guests" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log('Creating booking for property', propertyId);

    // Run customer lookup and availability check in PARALLEL for speed
    const [customerResult, availabilityResult] = await Promise.all([
      // Customer lookup/creation
      (async () => {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", guestInfo.email)
          .maybeSingle();

        if (existingCustomer) {
          console.log('Found existing customer');
          return { id: existingCustomer.id, error: null };
        }

        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            full_name: guestInfo.fullName,
            email: guestInfo.email,
            phone: guestInfo.phone,
          })
          .select("id")
          .single();

        if (customerError || !newCustomer) {
          console.error("Error creating customer record");
          return { id: null, error: customerError };
        }
        console.log('Created new customer');
        return { id: newCustomer.id, error: null };
      })(),
      // Availability check
      supabase.rpc("check_property_availability", {
        p_property_id: propertyId,
        p_check_in: checkInDate,
        p_check_out: checkOutDate,
      }),
    ]);

    // Handle customer result
    if (!customerResult.id) {
      return new Response(
        JSON.stringify({ error: "Failed to create customer record", details: customerResult.error?.message }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    const customerId = customerResult.id;

    // Handle availability result
    const { data: availability, error: availabilityError } = availabilityResult;
    console.log('Availability check result:', availability);

    if (availabilityError) {
      console.error("Error checking availability:", availabilityError);
      return new Response(
        JSON.stringify({ error: "Failed to check property availability", details: availabilityError.message }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (availability === false) {
      console.log("Property not available for selected dates");
      return new Response(
        JSON.stringify({ error: "Property is not available for the selected dates" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log("Property is available, verifying pricing...");

    let expectedPricing;
    try {
      expectedPricing = await calculateExpectedPricing(
        supabase,
        propertyId,
        checkInDate,
        checkOutDate,
        numGuests,
        pricing?.discountAmount || 0
      );
    } catch (pricingError: any) {
      console.error("Error during expected pricing calculation:", pricingError);
      return new Response(
        JSON.stringify({ error: pricingError.message }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!expectedPricing) {
      console.error("Expected pricing returned null for property:", propertyId);
      return new Response(
        JSON.stringify({ error: "Failed to calculate pricing" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const tolerance = 1;
    console.log("Pricing Comparison:", {
      received: pricing,
      expected: expectedPricing,
      tolerance
    });

    if (
      Math.abs(pricing.baseAmount - expectedPricing.baseAmount) > tolerance ||
      Math.abs(pricing.cleaningFee - expectedPricing.cleaningFee) > tolerance ||
      Math.abs(pricing.taxAmount - expectedPricing.taxAmount) > tolerance ||
      Math.abs(pricing.totalAmount - expectedPricing.totalAmount) > tolerance
    ) {
      console.error("Price manipulation detected / mismatch", {
        client: pricing,
        server: expectedPricing,
      });

      await writeAuditLog(supabase, {
        action: 'booking.price_manipulation_attempt',
        details: `Price mismatch detected for property ${propertyId}`,
      });

      return new Response(
        JSON.stringify({ error: "Pricing verification failed. Please refresh and try again." }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log("Pricing verified, creating booking...");

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId,
        customer_id: customerId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: numGuests,
        base_amount: expectedPricing.baseAmount,
        cleaning_fee: expectedPricing.cleaningFee,
        tax_amount: expectedPricing.taxAmount,
        discount_amount: pricing.discountAmount || 0,
        total_amount: expectedPricing.totalAmount,
        special_requests: guestInfo.specialRequests?.trim() || null,
        booked_via: "website",
        source: "direct",
        status: "pending",
        payment_status: "pending",
      })
      .select("id, booking_number")
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking");
      return new Response(
        JSON.stringify({ error: "Failed to create booking", details: bookingError?.message }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log(`Booking created successfully: ${booking.booking_number}`);

    await writeAuditLog(supabase, {
      action: 'booking.created',
      details: `Booking ${booking.booking_number} created via website`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          booking_number: booking.booking_number,
        },
        customerId,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-booking:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
