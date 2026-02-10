import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

interface GetBookingRequest {
  bookingNumber: string;
  email?: string; // Optional - if provided, verifies email matches
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingNumber, email }: GetBookingRequest = await req.json();

    if (!bookingNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: bookingNumber" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_number,
        check_in_date,
        check_out_date,
        num_guests,
        total_amount,
        base_amount,
        cleaning_fee,
        tax_amount,
        status,
        payment_status,
        special_requests,
        created_at,
        cancelled_at,
        cancellation_reason,
        property:properties (
          id,
          name,
          address,
          location,
          images
        ),
        customer:customers (
          full_name,
          email,
          phone
        )
      `)
      .eq("booking_number", bookingNumber)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found");
      return new Response(
        JSON.stringify({ success: false, error: "Booking not found" }),
        { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // If email is provided, verify it matches
    if (email) {
      const customerEmail = (booking.customer as any)?.email;
      if (!customerEmail || customerEmail.toLowerCase() !== email.toLowerCase()) {
        return new Response(
          JSON.stringify({ success: false, error: "Booking not found. Please check your booking number and email." }),
          { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, booking }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching booking");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
