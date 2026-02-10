import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { escapeHtml } from "../_shared/sanitize.ts";

type EmailType = "confirmation" | "cancellation" | "payment_receipt" | "check_in_reminder";

interface SendBookingEmailRequest {
  bookingId: string;
  emailType: EmailType;
  additionalData?: {
    refundAmount?: number;
    refundPercent?: number;
    refundMessage?: string;
    transactionRef?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId, emailType, additionalData }: SendBookingEmailRequest = await req.json();

    if (!bookingId || !emailType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: bookingId, emailType" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Fetch booking with related data
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
          name,
          address,
          city
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found for email sending");
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    if (!booking.customer?.email) {
      return new Response(
        JSON.stringify({ error: "Customer email not found" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Format dates
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    // Build email content based on type
    let subject = "";
    let html = "";

    const baseUrl = Deno.env.get("SITE_URL") || "https://brooklynhillsapartment.com";

    // Sanitize all user-controlled data before interpolation into HTML templates
    const safeName = escapeHtml(booking.customer.full_name);
    const safeBookingNumber = escapeHtml(booking.booking_number);
    const safePropertyName = escapeHtml(booking.property?.name || "Property");
    const safePropertyAddress = escapeHtml(`${booking.property?.address || ""}, ${booking.property?.city || ""}`);

    switch (emailType) {
      case "confirmation":
        subject = `Booking Confirmed - ${booking.booking_number}`;
        html = generateConfirmationEmail({
          customerName: safeName,
          bookingNumber: safeBookingNumber,
          propertyName: safePropertyName,
          propertyAddress: safePropertyAddress,
          checkInDate: formatDate(booking.check_in_date),
          checkOutDate: formatDate(booking.check_out_date),
          numGuests: booking.num_guests,
          totalAmount: formatCurrency(booking.total_amount),
          manageBookingUrl: `${baseUrl}/manage-booking`,
        });
        break;

      case "cancellation":
        subject = `Booking Cancelled - ${booking.booking_number}`;
        html = generateCancellationEmail({
          customerName: safeName,
          bookingNumber: safeBookingNumber,
          propertyName: safePropertyName,
          cancellationDate: formatDate(new Date().toISOString()),
          refundAmount: formatCurrency(additionalData?.refundAmount || 0),
          refundPercent: additionalData?.refundPercent || 0,
          refundMessage: escapeHtml(additionalData?.refundMessage) || "",
        });
        break;

      case "payment_receipt":
        subject = `Payment Receipt - ${booking.booking_number}`;
        html = generatePaymentReceiptEmail({
          customerName: safeName,
          bookingNumber: safeBookingNumber,
          amount: formatCurrency(booking.total_amount),
          transactionRef: escapeHtml(additionalData?.transactionRef as string) || safeBookingNumber,
          paymentDate: formatDate(new Date().toISOString()),
          propertyName: safePropertyName,
          checkInDate: formatDate(booking.check_in_date),
          checkOutDate: formatDate(booking.check_out_date),
        });
        break;

      case "check_in_reminder":
        subject = `Check-in Tomorrow - ${booking.booking_number}`;
        html = generateCheckInReminderEmail({
          customerName: safeName,
          bookingNumber: safeBookingNumber,
          propertyName: safePropertyName,
          propertyAddress: safePropertyAddress,
          checkInDate: formatDate(booking.check_in_date),
        });
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid email type" }),
          { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
        );
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Brooklyn Hills Apartments <noreply@brooklynhillsapartment.com>",
        to: [booking.customer.email],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email, status:", emailResponse.status);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResult }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    console.log(`Email sent successfully: type=${emailType}, booking=${bookingId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${emailType} email sent successfully`,
        emailId: emailResult.id,
        recipient: booking.customer.email,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending booking email");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});

// ===== EMAIL TEMPLATES =====

const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; background-color: #f5f5f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); color: #f5f5f0; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; font-family: 'Playfair Display', Georgia, serif; }
    .header .subtitle { color: #c9a227; margin-top: 8px; font-size: 14px; letter-spacing: 1px; }
    .content { padding: 40px 30px; }
    .booking-card { background: linear-gradient(135deg, #fafaf5 0%, #f5f5f0 100%); border: 1px solid #e5e5dc; border-left: 4px solid #c9a227; padding: 24px; margin: 24px 0; border-radius: 8px; }
    .booking-card h3 { margin: 0 0 16px 0; color: #1a1a2e; font-size: 18px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5dc; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { color: #1a1a2e; font-weight: 500; }
    .total-box { background: #1a1a2e; color: #f5f5f0; padding: 16px 20px; border-radius: 8px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .total-box .label { font-size: 14px; }
    .total-box .amount { font-size: 24px; font-weight: 700; color: #c9a227; }
    .button { display: inline-block; background: #c9a227; color: #1a1a2e !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .button:hover { background: #b8931f; }
    .footer { background: #f5f5f0; padding: 24px 30px; text-align: center; font-size: 13px; color: #666; }
    .footer a { color: #c9a227; text-decoration: none; }
    .refund-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .refund-box.no-refund { background: #fee2e2; border-color: #ef4444; }
    .success-badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .cancelled-badge { background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  </style>
`;

function generateConfirmationEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed</h1>
          <div class="subtitle">BROOKLYN HILLS APARTMENTS</div>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for choosing Brooklyn Hills Apartments! Your booking has been confirmed and we're excited to welcome you.</p>

          <div class="booking-card">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference</span>
              <span class="detail-value" style="color: #c9a227; font-weight: 700;">${data.bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address</span>
              <span class="detail-value">${data.propertyAddress}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in</span>
              <span class="detail-value">${data.checkInDate} (from 2:00 PM)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-out</span>
              <span class="detail-value">${data.checkOutDate} (by 11:00 AM)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Guests</span>
              <span class="detail-value">${data.numGuests}</span>
            </div>
            <div class="total-box">
              <span class="label">Total Paid</span>
              <span class="amount">${data.totalAmount}</span>
            </div>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Save this email as your booking confirmation</li>
            <li>You'll receive a check-in reminder 24 hours before arrival</li>
            <li>Bring a valid ID for check-in</li>
          </ul>

          <center>
            <a href="${data.manageBookingUrl}" class="button">Manage Your Booking</a>
          </center>

          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>We look forward to hosting you!</p>
          <p>Warm regards,<br><strong>Brooklyn Hills Apartments Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Brooklyn Hills Apartments</strong><br>
          Lagos, Nigeria<br>
          <a href="mailto:info@brooklynhillsapartment.com">info@brooklynhillsapartment.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCancellationEmail(data: any): string {
  const hasRefund = data.refundPercent > 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);">
          <h1>Booking Cancelled</h1>
          <div class="subtitle">BROOKLYN HILLS APARTMENTS</div>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>This email confirms that your booking has been cancelled as requested.</p>

          <div class="booking-card">
            <h3>Cancellation Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference</span>
              <span class="detail-value">${data.bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cancellation Date</span>
              <span class="detail-value">${data.cancellationDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="cancelled-badge">Cancelled</span>
            </div>
          </div>

          <div class="refund-box ${hasRefund ? '' : 'no-refund'}">
            <strong>Refund Information</strong>
            <p style="margin: 8px 0 0 0;">
              ${hasRefund
                ? `You will receive a refund of <strong>${data.refundAmount}</strong> (${data.refundPercent}% of your payment). This will be processed within 5-7 business days to your original payment method.`
                : `${data.refundMessage || 'Unfortunately, this cancellation does not qualify for a refund based on our cancellation policy.'}`
              }
            </p>
          </div>

          <p>We're sorry to see you go. If you cancelled due to any issues with our service, please let us know so we can improve.</p>
          <p>We hope to welcome you in the future!</p>
          <p>Warm regards,<br><strong>Brooklyn Hills Apartments Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Brooklyn Hills Apartments</strong><br>
          <a href="mailto:info@brooklynhillsapartment.com">info@brooklynhillsapartment.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentReceiptEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <div class="subtitle">BROOKLYN HILLS APARTMENTS</div>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your payment. This email serves as your official receipt.</p>

          <div class="booking-card">
            <h3>Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference</span>
              <span class="detail-value">${data.bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction Reference</span>
              <span class="detail-value">${data.transactionRef}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date</span>
              <span class="detail-value">${data.paymentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stay Period</span>
              <span class="detail-value">${data.checkInDate} - ${data.checkOutDate}</span>
            </div>
            <div class="total-box">
              <span class="label">Amount Paid</span>
              <span class="amount">${data.amount}</span>
            </div>
          </div>

          <p><strong>Important:</strong> Please keep this email as your payment receipt for your records.</p>
          <p>If you have any questions about this payment, please contact us with your booking reference.</p>
          <p>Warm regards,<br><strong>Brooklyn Hills Apartments Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Brooklyn Hills Apartments</strong><br>
          <a href="mailto:info@brooklynhillsapartment.com">info@brooklynhillsapartment.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCheckInReminderEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Check-in Tomorrow!</h1>
          <div class="subtitle">BROOKLYN HILLS APARTMENTS</div>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>We're excited to welcome you tomorrow! Here's everything you need to know for a smooth check-in.</p>

          <div class="booking-card">
            <h3>Check-in Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference</span>
              <span class="detail-value" style="color: #c9a227; font-weight: 700;">${data.bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address</span>
              <span class="detail-value">${data.propertyAddress}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in Date</span>
              <span class="detail-value">${data.checkInDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in Time</span>
              <span class="detail-value" style="color: #c9a227; font-weight: 700;">From 2:00 PM</span>
            </div>
          </div>

          <p><strong>What to Bring:</strong></p>
          <ul>
            <li>Valid government-issued ID</li>
            <li>This confirmation email (printed or on your phone)</li>
          </ul>

          <p><strong>Need Early Check-in?</strong><br>
          Contact us in advance and we'll do our best to accommodate you (subject to availability).</p>

          <p>See you tomorrow!</p>
          <p>Warm regards,<br><strong>Brooklyn Hills Apartments Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Brooklyn Hills Apartments</strong><br>
          <a href="mailto:info@brooklynhillsapartment.com">info@brooklynhillsapartment.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
