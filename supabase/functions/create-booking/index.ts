import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";
import { writeAuditLog } from "../_shared/audit.ts";

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

// Calculate expected pricing server-side
async function calculateExpectedPricing(
  supabase: any,
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
  numGuests: number,
  discountAmount: number
): Promise<{ baseAmount: number; cleaningFee: number; taxAmount: number; totalAmount: number; nights: number } | null> {
  // Fetch property details
  const { data: property, error } = await supabase
    .from("properties")
    .select("base_price_per_night, cleaning_fee, max_guests")
    .eq("id", propertyId)
    .single();

  if (error || !property) {
    return null;
  }

  // Validate guest count
  if (numGuests > property.max_guests) {
    throw new Error(`Maximum ${property.max_guests} guests allowed for this property`);
  }

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new Error("Check-out date must be after check-in date");
  }

  // Calculate amounts
  const baseAmount = property.base_price_per_night * nights;
  const cleaningFee = property.cleaning_fee || 0;
  const subtotal = baseAmount + cleaningFee - discountAmount;

  // Tax calculation (7.5% VAT - matching client-side calculation)
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

// Helper functions
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Rate limit: 5 booking attempts per minute per IP
  const rateLimited = checkRateLimit(req, getCorsHeaders(req), { maxRequests: 5, windowSeconds: 60 });
  if (rateLimited) return rateLimited;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role to bypass RLS for public booking creation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateBookingRequest = await req.json();
    const { propertyId, checkInDate, checkOutDate, numGuests, guestInfo, pricing } = body;

    // Validate required fields with type checking
    if (!propertyId || typeof propertyId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid property ID" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!checkInDate || !isValidDate(checkInDate)) {
      return new Response(
        JSON.stringify({ error: "Invalid check-in date" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!checkOutDate || !isValidDate(checkOutDate)) {
      return new Response(
        JSON.stringify({ error: "Invalid check-out date" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!guestInfo?.email || !isValidEmail(guestInfo.email)) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!guestInfo?.fullName || guestInfo.fullName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Full name is required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!numGuests || numGuests < 1 || numGuests > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid number of guests" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log('Creating booking for property', propertyId);

    // Step 1: Check if customer exists or create new one
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", guestInfo.email)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log('Found existing customer');
    } else {
      // Create new customer
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
        return new Response(
          JSON.stringify({ error: "Failed to create customer record", details: customerError?.message }),
          { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }
      customerId = newCustomer.id;
      console.log('Created new customer');
    }

    // Step 2: Verify property availability
    console.log(`Checking availability for property ${propertyId} from ${checkInDate} to ${checkOutDate}`);

    const { data: availability, error: availabilityError } = await supabase
      .rpc("check_property_availability", {
        p_property_id: propertyId,
        p_check_in: checkInDate,
        p_check_out: checkOutDate,
      });

    console.log('Availability check result:', availability ? 'available' : 'unavailable');

    if (availabilityError) {
      console.error("Error checking availability");
      return new Response(
        JSON.stringify({ error: "Failed to check property availability", details: availabilityError.message }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!availability) {
      console.log("Property not available for selected dates");
      return new Response(
        JSON.stringify({ error: "Property is not available for the selected dates" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log("Property is available, verifying pricing...");

    // Step 3: Calculate and verify pricing server-side
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
      return new Response(
        JSON.stringify({ error: pricingError.message }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!expectedPricing) {
      return new Response(
        JSON.stringify({ error: "Failed to calculate pricing" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Verify client-provided pricing matches server calculation (with small tolerance for rounding)
    const tolerance = 1; // 1 Naira tolerance
    if (
      Math.abs(pricing.baseAmount - expectedPricing.baseAmount) > tolerance ||
      Math.abs(pricing.cleaningFee - expectedPricing.cleaningFee) > tolerance ||
      Math.abs(pricing.taxAmount - expectedPricing.taxAmount) > tolerance ||
      Math.abs(pricing.totalAmount - expectedPricing.totalAmount) > tolerance
    ) {
      console.error("Price manipulation detected", {
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

    // Step 4: Create the booking with server-verified pricing
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
    console.error("Error in create-booking");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
