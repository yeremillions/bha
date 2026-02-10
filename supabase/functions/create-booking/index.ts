import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

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

    // Validate required fields
    if (!propertyId || !checkInDate || !checkOutDate || !guestInfo?.email || !guestInfo?.fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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

    console.log("Property is available, creating booking...");

    // Step 3: Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: propertyId,
        customer_id: customerId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: numGuests,
        base_amount: pricing.baseAmount,
        cleaning_fee: pricing.cleaningFee,
        tax_amount: pricing.taxAmount,
        discount_amount: pricing.discountAmount,
        total_amount: pricing.totalAmount,
        special_requests: guestInfo.specialRequests || null,
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
