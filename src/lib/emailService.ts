import { Resend } from 'resend';

// Initialize Resend with API key
// In production, this should be stored in environment variables
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || '');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Resend
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    const { to, subject, html, from } = options;

    const response = await resend.emails.send({
      from: from || 'Brooklyn Hills Apartments <noreply@brooklynhills.ng>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (
  customerEmail: string,
  bookingData: {
    bookingNumber: string;
    customerName: string;
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    guestCount: number;
  }
) => {
  const html = generateBookingConfirmationEmail(bookingData);

  return sendEmail({
    to: customerEmail,
    subject: `Booking Confirmation - ${bookingData.bookingNumber}`,
    html,
  });
};

/**
 * Send payment receipt email
 */
export const sendPaymentReceipt = async (
  customerEmail: string,
  paymentData: {
    bookingNumber: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    date: string;
  }
) => {
  const html = generatePaymentReceiptEmail(paymentData);

  return sendEmail({
    to: customerEmail,
    subject: `Payment Receipt - ${paymentData.bookingNumber}`,
    html,
  });
};

/**
 * Send check-in reminder email
 */
export const sendCheckInReminder = async (
  customerEmail: string,
  reminderData: {
    customerName: string;
    bookingNumber: string;
    propertyName: string;
    checkInDate: string;
    checkInTime: string;
    propertyAddress: string;
  }
) => {
  const html = generateCheckInReminderEmail(reminderData);

  return sendEmail({
    to: customerEmail,
    subject: `Check-in Reminder - Tomorrow at ${reminderData.checkInTime}`,
    html,
  });
};

/**
 * Send cancellation confirmation email
 */
export const sendCancellationConfirmation = async (
  customerEmail: string,
  cancellationData: {
    bookingNumber: string;
    customerName: string;
    propertyName: string;
    refundAmount: number;
    cancellationDate: string;
  }
) => {
  const html = generateCancellationEmail(cancellationData);

  return sendEmail({
    to: customerEmail,
    subject: `Booking Cancelled - ${cancellationData.bookingNumber}`,
    html,
  });
};

// ===== EMAIL TEMPLATES =====

const emailStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .booking-details {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .booking-details h3 {
      margin-top: 0;
      color: #667eea;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
    }
    .total-row {
      background-color: #667eea;
      color: white;
      padding: 15px;
      margin-top: 15px;
      border-radius: 4px;
      font-size: 18px;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #667eea;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
      border-radius: 0 0 8px 8px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
`;

/**
 * Generate booking confirmation email HTML
 */
function generateBookingConfirmationEmail(data: any): string {
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
          <h1>🎉 Booking Confirmed!</h1>
        </div>

        <div class="content">
          <p>Dear ${data.customerName},</p>

          <p>Thank you for choosing Brooklyn Hills Apartments! Your booking has been confirmed.</p>

          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Number:</span>
              <span class="detail-value"><strong>${data.bookingNumber}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span class="detail-value">${data.checkInDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span class="detail-value">${data.checkOutDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span class="detail-value">${data.guestCount}</span>
            </div>
            <div class="total-row">
              <div style="display: flex; justify-content: space-between;">
                <span>Total Amount:</span>
                <span>₦${data.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>You'll receive a check-in reminder 24 hours before your arrival</li>
            <li>Check-in time is 2:00 PM</li>
            <li>Check-out time is 12:00 PM</li>
            <li>Contact us if you need early check-in or late check-out</li>
          </ul>

          <p>If you have any questions, feel free to reach out to us.</p>

          <p>We look forward to welcoming you!</p>

          <p>Best regards,<br>
          <strong>Brooklyn Hills Apartments Team</strong></p>
        </div>

        <div class="footer">
          <p>Brooklyn Hills Apartments<br>
          Lagos, Nigeria<br>
          Phone: +234 XXX XXX XXXX<br>
          Email: <a href="mailto:info@brooklynhills.ng">info@brooklynhills.ng</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate payment receipt email HTML
 */
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
          <h1>💳 Payment Received</h1>
        </div>

        <div class="content">
          <p>Dear ${data.customerName},</p>

          <p>Thank you for your payment. This email confirms that we have received your payment successfully.</p>

          <div class="booking-details">
            <h3>Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Number:</span>
              <span class="detail-value"><strong>${data.bookingNumber}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-value"><strong>₦${data.amount.toLocaleString()}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction Reference:</span>
              <span class="detail-value">${data.transactionRef}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.date}</span>
            </div>
          </div>

          <p><strong>Important:</strong> Please keep this email as your payment receipt.</p>

          <p>If you have any questions about this payment, please contact us with your booking number.</p>

          <p>Best regards,<br>
          <strong>Brooklyn Hills Apartments Team</strong></p>
        </div>

        <div class="footer">
          <p>Brooklyn Hills Apartments<br>
          Email: <a href="mailto:info@brooklynhills.ng">info@brooklynhills.ng</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate check-in reminder email HTML
 */
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
          <h1>⏰ Check-in Reminder</h1>
        </div>

        <div class="content">
          <p>Dear ${data.customerName},</p>

          <p>This is a friendly reminder that your check-in is scheduled for <strong>tomorrow</strong>!</p>

          <div class="booking-details">
            <h3>Check-in Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Number:</span>
              <span class="detail-value"><strong>${data.bookingNumber}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in Date:</span>
              <span class="detail-value">${data.checkInDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in Time:</span>
              <span class="detail-value"><strong>${data.checkInTime}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${data.propertyAddress}</span>
            </div>
          </div>

          <p><strong>What to Bring:</strong></p>
          <ul>
            <li>Valid ID (Driver's License, Passport, or National ID)</li>
            <li>Booking confirmation (this email)</li>
            <li>Payment confirmation (if not paid online)</li>
          </ul>

          <p><strong>Check-in Process:</strong></p>
          <ol>
            <li>Arrive at the reception</li>
            <li>Present your ID and booking confirmation</li>
            <li>Complete a quick registration form</li>
            <li>Receive your room keys and welcome package</li>
          </ol>

          <p>If you need to arrive earlier or later than ${data.checkInTime}, please contact us in advance.</p>

          <p>We're excited to welcome you tomorrow!</p>

          <p>Best regards,<br>
          <strong>Brooklyn Hills Apartments Team</strong></p>
        </div>

        <div class="footer">
          <p>Brooklyn Hills Apartments<br>
          Phone: +234 XXX XXX XXXX<br>
          Email: <a href="mailto:info@brooklynhills.ng">info@brooklynhills.ng</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate cancellation confirmation email HTML
 */
function generateCancellationEmail(data: any): string {
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
        <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h1>Booking Cancelled</h1>
        </div>

        <div class="content">
          <p>Dear ${data.customerName},</p>

          <p>This email confirms that your booking has been cancelled as requested.</p>

          <div class="booking-details">
            <h3>Cancellation Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Number:</span>
              <span class="detail-value"><strong>${data.bookingNumber}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cancellation Date:</span>
              <span class="detail-value">${data.cancellationDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Refund Amount:</span>
              <span class="detail-value"><strong>₦${data.refundAmount.toLocaleString()}</strong></span>
            </div>
          </div>

          <p><strong>Refund Information:</strong></p>
          <p>Your refund of <strong>₦${data.refundAmount.toLocaleString()}</strong> will be processed within 5-7 business days to your original payment method.</p>

          <p>We're sorry to see you go. If you cancelled due to an issue, please let us know how we can improve.</p>

          <p>We hope to serve you again in the future!</p>

          <p>Best regards,<br>
          <strong>Brooklyn Hills Apartments Team</strong></p>
        </div>

        <div class="footer">
          <p>Brooklyn Hills Apartments<br>
          Email: <a href="mailto:info@brooklynhills.ng">info@brooklynhills.ng</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
