import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

interface GetBookingRequest {
  bookingNumber: string;
  email: string; // Required for security
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Rate limit: 10 requests per minute per IP
  const rateLimited = checkRateLimit(req, getCorsHeaders(req), { maxRequests: 10, windowSeconds: 60 });
  if (rateLimited) return rateLimited;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingNumber, email }: GetBookingRequest = await req.json();

    // Validate required fields
    if (!bookingNumber || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: bookingNumber and email" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Validate booking number format (BK followed by digits)
    const bookingNumberRegex = /^BK\d+$/;
    if (!bookingNumberRegex.test(bookingNumber)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid booking number format" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
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
      // Return generic error to prevent enumeration attacks
      return new Response(
        JSON.stringify({ success: false, error: "Booking not found. Please check your booking number and email." }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Email is required - verify it matches (case-insensitive)
    const customerEmail = (booking.customer as any)?.email;
    if (!customerEmail || customerEmail.toLowerCase() !== email.toLowerCase()) {
      // Return same generic error to prevent email enumeration
      return new Response(
        JSON.stringify({ success: false, error: "Booking not found. Please check your booking number and email." }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
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
