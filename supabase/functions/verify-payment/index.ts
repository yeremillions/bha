import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

interface PaymentVerifyRequest {
  reference: string;
  bookingId: string;
  propertyId: string;
  amount: number;
  metadata?: Record<string, unknown>;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, unknown>;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Rate limit: 10 verification attempts per minute per IP
  const rateLimited = checkRateLimit(req, getCorsHeaders(req), { maxRequests: 10, windowSeconds: 60 });
  if (rateLimited) return rateLimited;

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reference, bookingId, propertyId, metadata }: PaymentVerifyRequest = await req.json();

    if (!reference || !bookingId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: reference, bookingId" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Idempotency: check if this reference was already processed
    const { data: existingTxn } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_reference", reference)
      .eq("status", "completed")
      .maybeSingle();

    if (existingTxn) {
      return new Response(
        JSON.stringify({ error: "This payment reference has already been processed" }),
        { status: 409, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Get booking details first to verify amount server-side (don't trust client amount)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("booking_number, customer_id, total_amount")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Use the server-side booking amount, not the client-supplied value
    const amount = booking.total_amount;

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData: PaystackVerifyResponse = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const paymentData = paystackData.data;
    if (!paymentData || paymentData.status !== "success") {
      return new Response(
        JSON.stringify({ error: "Payment not successful" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Verify amount matches the booking's stored total (Paystack returns amount in kobo)
    const expectedAmountKobo = Math.round(amount * 100);
    if (paymentData.amount !== expectedAmountKobo) {
      console.error('Payment amount mismatch for booking:', bookingId);
      return new Response(
        JSON.stringify({ error: "Payment amount does not match booking total" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("name")
      .eq("id", propertyId)
      .single();

    if (propertyError) {
      console.error("Error fetching property");
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        transaction_type: "booking",
        category: "accommodation",
        amount: amount,
        payment_method: "paystack",
        booking_id: bookingId,
        customer_id: booking?.customer_id || null,
        description: `Payment for booking ${booking?.booking_number || bookingId} - ${property?.name || "Property"}`,
        payment_reference: reference,
        status: "completed",
        processed_at: paymentData.paid_at,
        metadata: {
          ...metadata,
          paystack_reference: reference,
          paystack_transaction_id: paymentData.id,
          paystack_channel: paymentData.channel,
          customer_email: paymentData.customer?.email,
        },
      })
      .select()
      .single();

    let transactionWarning: string | null = null;
    if (transactionError) {
      console.error("Error creating transaction record");
      transactionWarning = `Transaction record not created: ${transactionError.message}`;
      // Continue - payment was successful, but track the warning
    }

    // Update booking payment status
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking payment status");
      return new Response(
        JSON.stringify({ 
          error: "Payment verified but failed to update booking",
          paymentVerified: true 
        }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment processed successfully for booking: ${booking?.booking_number}`);

    // Send confirmation email (fire and forget - don't block on email)
    try {
      const emailPayload = {
        bookingId: bookingId,
        emailType: "confirmation",
        additionalData: {
          transactionRef: reference,
        },
      };

      // Call the send-booking-email function
      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-booking-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify(emailPayload),
        }
      );

      if (emailResponse.ok) {
        console.log("Confirmation email sent successfully");
      } else {
        console.warn("Failed to send confirmation email, status:", emailResponse.status);
      }
    } catch (emailError) {
      console.warn("Error sending confirmation email");
      // Don't fail the payment if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and processed successfully",
        booking: updatedBooking,
        transaction: {
          id: transaction?.id,
          reference: reference,
          amount: amount,
          channel: paymentData.channel,
          paid_at: paymentData.paid_at,
        },
        warning: transactionWarning,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing payment");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
