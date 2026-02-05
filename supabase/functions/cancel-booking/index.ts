import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CancelBookingRequest {
  bookingId: string;
  reason: string;
  email: string; // For verification
}

interface CancellationPolicy {
  fullRefundDays: number;
  partialRefundDays: number;
  partialRefundPercent: number;
  noRefundMessage: string;
}

const defaultCancellationPolicy: CancellationPolicy = {
  fullRefundDays: 7,
  partialRefundDays: 3,
  partialRefundPercent: 50,
  noRefundMessage: "Cancellations made less than 3 days before check-in are non-refundable.",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId, reason, email }: CancelBookingRequest = await req.json();

    if (!bookingId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: bookingId, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing cancellation for booking: ${bookingId}`);

    // Step 1: Fetch the booking with customer info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        customer:customers (
          id,
          full_name,
          email,
          phone
        ),
        property:properties (
          id,
          name
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingError);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify email matches
    if (booking.customer?.email?.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Email does not match booking records" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return new Response(
        JSON.stringify({ error: "Booking is already cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (booking.status === "checked_in" || booking.status === "checked_out" || booking.status === "completed") {
      return new Response(
        JSON.stringify({ error: "Cannot cancel a booking that has already started or completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Fetch cancellation policy from settings
    const { data: settingsData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "cancellation_policy")
      .single();

    const cancellationPolicy: CancellationPolicy = settingsData?.value
      ? { ...defaultCancellationPolicy, ...(settingsData.value as unknown as CancellationPolicy) }
      : defaultCancellationPolicy;

    console.log("Cancellation policy:", cancellationPolicy);

    // Step 3: Calculate refund amount based on policy
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercent = 0;
    let refundAmount = 0;
    let refundMessage = "";

    if (booking.payment_status === "paid") {
      if (daysUntilCheckIn >= cancellationPolicy.fullRefundDays) {
        refundPercent = 100;
        refundAmount = booking.total_amount;
        refundMessage = "Full refund - cancelled more than " + cancellationPolicy.fullRefundDays + " days before check-in";
      } else if (daysUntilCheckIn >= cancellationPolicy.partialRefundDays) {
        refundPercent = cancellationPolicy.partialRefundPercent;
        refundAmount = Math.round(booking.total_amount * (cancellationPolicy.partialRefundPercent / 100) * 100) / 100;
        refundMessage = `${cancellationPolicy.partialRefundPercent}% refund - cancelled ${daysUntilCheckIn} days before check-in`;
      } else {
        refundPercent = 0;
        refundAmount = 0;
        refundMessage = cancellationPolicy.noRefundMessage;
      }
    } else {
      refundMessage = "No refund applicable - booking was not paid";
    }

    console.log(`Refund calculation: ${refundPercent}% = ${refundAmount}, Days until check-in: ${daysUntilCheckIn}`);

    // Step 4: Get original payment transaction for Paystack refund
    let originalTransaction = null;
    let paystackRefundResult = null;

    if (refundAmount > 0) {
      const { data: txn } = await supabase
        .from("transactions")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("transaction_type", "booking")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      originalTransaction = txn;

      // Step 5: Process Paystack refund if applicable
      if (originalTransaction?.payment_method === "paystack" && originalTransaction?.payment_reference && paystackSecretKey) {
        try {
          console.log("Processing Paystack refund for reference:", originalTransaction.payment_reference);

          // First, get the transaction details from Paystack
          const verifyResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(originalTransaction.payment_reference)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${paystackSecretKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.status && verifyData.data?.id) {
            // Create refund on Paystack
            const refundResponse = await fetch(
              "https://api.paystack.co/refund",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${paystackSecretKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  transaction: verifyData.data.id,
                  amount: Math.round(refundAmount * 100), // Convert to kobo
                  merchant_note: `Refund for cancelled booking ${booking.booking_number}. Reason: ${reason || "Customer requested cancellation"}`,
                }),
              }
            );

            paystackRefundResult = await refundResponse.json();
            console.log("Paystack refund result:", paystackRefundResult);

            if (!paystackRefundResult.status) {
              console.warn("Paystack refund failed:", paystackRefundResult.message);
              // Continue with cancellation but note the refund failure
            }
          }
        } catch (paystackError) {
          console.error("Error processing Paystack refund:", paystackError);
          // Continue with cancellation - refund will need manual processing
        }
      }

      // Step 6: Create refund transaction record
      const { error: refundTxnError } = await supabase
        .from("transactions")
        .insert({
          transaction_type: "refund",
          category: "other_expenses",
          amount: refundAmount,
          booking_id: bookingId,
          customer_id: booking.customer_id,
          payment_method: originalTransaction?.payment_method || "bank_transfer",
          payment_reference: paystackRefundResult?.data?.id
            ? `REFUND-${paystackRefundResult.data.id}`
            : `REFUND-${booking.booking_number}`,
          status: paystackRefundResult?.status ? "completed" : "pending",
          description: `Refund for cancelled booking ${booking.booking_number}`,
          metadata: {
            original_transaction_id: originalTransaction?.id,
            cancellation_reason: reason,
            refund_percent: refundPercent,
            days_until_checkin: daysUntilCheckIn,
            paystack_refund: paystackRefundResult,
          },
        });

      if (refundTxnError) {
        console.error("Error creating refund transaction:", refundTxnError);
        // Continue - the booking will still be cancelled
      }
    }

    // Step 7: Update booking status
    const newPaymentStatus = refundAmount > 0
      ? (refundPercent === 100 ? "refunded" : "partial")
      : booking.payment_status;

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: newPaymentStatus,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || "Customer requested cancellation",
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to cancel booking", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 8: Cancel related housekeeping tasks
    const { data: housekeepingTasks, error: hkError } = await supabase
      .from("housekeeping_tasks")
      .update({
        status: "cancelled",
        completion_notes: `Cancelled due to booking cancellation: ${booking.booking_number}`
      })
      .eq("booking_id", bookingId)
      .neq("status", "completed")
      .select();

    if (hkError) {
      console.warn("Error cancelling housekeeping tasks:", hkError);
    } else {
      console.log(`Cancelled ${housekeepingTasks?.length || 0} housekeeping tasks`);
    }

    // Step 9: Prepare response
    const response = {
      success: true,
      message: "Booking cancelled successfully",
      booking: {
        id: bookingId,
        booking_number: booking.booking_number,
        status: "cancelled",
        payment_status: newPaymentStatus,
      },
      refund: {
        amount: refundAmount,
        percent: refundPercent,
        message: refundMessage,
        processed: paystackRefundResult?.status || false,
        paystack_refund_id: paystackRefundResult?.data?.id || null,
      },
      housekeeping_tasks_cancelled: housekeepingTasks?.length || 0,
      customer: {
        name: booking.customer?.full_name,
        email: booking.customer?.email,
      },
      property: {
        name: booking.property?.name,
      },
    };

    console.log("Cancellation completed:", response);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing cancellation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
