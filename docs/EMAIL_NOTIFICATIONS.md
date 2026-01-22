# Email Notifications System

This document describes the email notification system for Brooklyn Hills Apartments.

## Overview

The application uses [Resend](https://resend.com) for sending transactional emails. Email notifications are automatically triggered for key booking events.

## Features

### Automated Emails

1. **Booking Confirmation** - Sent immediately when a booking is created
   - Booking details (number, dates, property)
   - Guest information
   - Total amount
   - Check-in instructions

2. **Payment Receipt** - Sent when payment status changes to "paid"
   - Payment confirmation
   - Transaction details
   - Itemized breakdown (base amount, cleaning fee, tax, discount)
   - Receipt number (booking number)

3. **Cancellation Confirmation** - Sent when a booking is cancelled
   - Cancellation details
   - Refund information (if applicable)
   - Customer support contact

4. **Check-in Reminder** - Sent 24 hours before check-in (scheduled job)
   - Reminder about upcoming stay
   - Check-in time and location
   - Property address
   - Special instructions
   - Contact information

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Brooklyn Hills Production")
4. Copy the API key (starts with `re_`)

### 3. Configure Your Domain (Production Only)

For production, you should use your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `brooklynhillsapartment.com`)
4. Follow DNS configuration instructions
5. Wait for verification (usually 5-10 minutes)

For development/testing, you can use Resend's test domain.

### 4. Add Environment Variables

Add your Resend API key to your `.env` file:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

**Important**: Never commit your `.env` file to version control!

### 5. Update Sender Email (Optional)

Once your domain is verified, update the sender email in `/src/lib/emailService.ts`:

```typescript
from: 'Brooklyn Hills Apartments <noreply@brooklynhillsapartment.com>'
```

## Email Templates

All email templates are defined in `/src/lib/emailService.ts`. Each template includes:

- Professional HTML layout
- Inline CSS for email client compatibility
- Responsive design
- Brand colors and styling

### Customizing Templates

To customize email content:

1. Open `/src/lib/emailService.ts`
2. Find the template function (e.g., `generateBookingConfirmationEmail`)
3. Modify the HTML and styling
4. Test thoroughly across email clients

**Testing tip**: Use Resend's test mode to preview emails before sending to real customers.

## Integration Points

### Booking Flow

Emails are automatically sent from these hooks in `/src/hooks/useBookings.ts`:

```typescript
// Booking creation
useCreateBooking()
  → onSuccess → sendBookingConfirmation()

// Payment update
useUpdatePaymentStatus()
  → onSuccess (when status = 'paid') → sendPaymentReceipt()

// Booking cancellation
useCancelBooking()
  → onSuccess → sendCancellationConfirmation()
```

### Check-in Reminders (Scheduled)

Check-in reminders require a scheduled job. See "Setting Up Scheduled Jobs" below.

## Setting Up Scheduled Jobs

### Option 1: Supabase Edge Functions + pg_cron (Recommended)

1. Create a Supabase Edge Function:

```typescript
// supabase/functions/send-check-in-reminders/index.ts
import { sendCheckInReminders } from '../../../src/lib/scheduledJobs';

Deno.serve(async (req) => {
  // Verify request is from authorized source
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== Deno.env.get('CRON_API_KEY')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const results = await sendCheckInReminders();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

2. Deploy the edge function:
```bash
supabase functions deploy send-check-in-reminders
```

3. Set up pg_cron in Supabase:
```sql
-- Run daily at 9:00 AM
SELECT cron.schedule(
  'send-check-in-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-check-in-reminders',
    headers := '{"x-api-key": "your-secret-key"}'::jsonb
  )
  $$
);
```

### Option 2: External Cron Service

1. Create an API endpoint that calls `sendCheckInReminders()`
2. Secure it with an API key
3. Use any cron service to call it daily:
   - GitHub Actions (free)
   - AWS Lambda + EventBridge
   - Vercel Cron Jobs
   - Google Cloud Scheduler

## Testing

### Development Testing

1. Use Resend's test mode (free)
2. All emails will be captured in the Resend dashboard
3. No emails are sent to real addresses

### Test Email Sending

```typescript
import { sendBookingConfirmation } from '@/lib/emailService';

// Test in console or component
await sendBookingConfirmation('test@example.com', {
  bookingNumber: 'BK001',
  customerName: 'John Doe',
  propertyName: 'Luxury Studio',
  checkInDate: 'January 20, 2026',
  checkOutDate: 'January 25, 2026',
  totalPrice: 150000,
  guestCount: 2,
});
```

### Email Client Testing

Test your emails across different email clients:
- Gmail (web, mobile app)
- Outlook (web, desktop)
- Apple Mail (macOS, iOS)
- Yahoo Mail
- Mobile devices (iOS, Android)

## Monitoring

### Resend Dashboard

Monitor email delivery in the Resend dashboard:
- **Logs**: View all sent emails
- **Analytics**: Track opens, clicks, bounces
- **Webhooks**: Get notified of delivery events

### Application Logs

Email sending is logged to the console:
```
✓ Booking confirmation email sent successfully
✗ Failed to send payment receipt email: [error details]
```

Check browser console (development) or server logs (production).

## Error Handling

Email failures **do not** break the booking flow:

- If email sending fails, an error is logged
- The booking/payment/cancellation still succeeds
- User sees success message for the booking action
- Admin should monitor logs for email failures

This ensures bookings are never lost due to email issues.

## Rate Limits

Resend free tier limits:
- **100 emails per day**
- **3,000 emails per month**

For production with higher volume, upgrade to a paid plan.

## Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Validate email addresses** - Check format before sending
3. **Sanitize user input** - Prevent HTML injection in email content
4. **Use HTTPS** - All API calls to Resend use HTTPS
5. **Secure scheduled jobs** - Use API keys for cron endpoints

## Troubleshooting

### Emails Not Sending

1. Check API key is correct in `.env`
2. Verify email service is imported correctly
3. Check browser/server console for errors
4. Verify customer has a valid email address
5. Check Resend dashboard for failed deliveries

### Emails Going to Spam

1. Verify your domain in Resend (production)
2. Set up SPF and DKIM records
3. Avoid spam trigger words
4. Include unsubscribe link (for marketing emails)
5. Maintain good sender reputation

### Template Rendering Issues

1. Use inline CSS (external stylesheets don't work)
2. Test across multiple email clients
3. Use tables for layout (better email client support)
4. Avoid complex CSS (flexbox, grid)

## Future Enhancements

Potential improvements:

1. **Email Templates in Database**
   - Store templates in Supabase
   - Allow admin customization
   - Support multiple languages

2. **Email Preferences**
   - Let customers opt-in/opt-out
   - Choose notification types
   - Set communication preferences

3. **SMS Notifications**
   - Add SMS for critical updates
   - Use Twilio or similar service
   - Fallback when email fails

4. **Advanced Analytics**
   - Track email open rates
   - Monitor click-through rates
   - A/B test subject lines

5. **Unsubscribe Management**
   - One-click unsubscribe
   - Preference center
   - Compliance with regulations

## Support

For issues with the email system:

- **Resend Support**: [https://resend.com/support](https://resend.com/support)
- **Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **Code Issues**: Check `/src/lib/emailService.ts` and `/src/hooks/useEmailNotifications.ts`

## Related Files

- `/src/lib/emailService.ts` - Email service and templates
- `/src/hooks/useEmailNotifications.ts` - React Query email hooks
- `/src/hooks/useBookings.ts` - Booking workflow integration
- `/src/lib/scheduledJobs.ts` - Check-in reminder scheduled job
- `.env.example` - Environment variable template
