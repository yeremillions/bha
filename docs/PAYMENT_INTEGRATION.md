# Payment Integration (Paystack)

This document describes the Paystack payment integration for Brooklyn Hills Apartments.

## Overview

The application uses [Paystack](https://paystack.com) for processing online payments. Paystack is Nigeria's leading payment gateway, supporting cards, bank transfers, USSD, and mobile money.

## Features

### Payment Methods Supported

- **Card Payments** (Visa, Mastercard, Verve)
- **Bank Transfer** (Direct bank account transfer)
- **USSD** (Mobile banking codes)
- **Mobile Money** (Mobile wallet payments)
- **QR Code** (Scan and pay)

### Key Capabilities

1. **Inline Payment Popup** - Seamless checkout experience
2. **Payment Verification** - Automatic verification of transactions
3. **Transaction Recording** - All payments stored in database
4. **Auto Booking Confirmation** - Bookings confirmed on successful payment
5. **Email Notifications** - Payment receipts sent automatically
6. **Webhook Support** - Real-time payment event handling
7. **Refund Management** - Process refunds through Paystack dashboard

## Setup Instructions

### 1. Create a Paystack Account

1. Go to [https://paystack.com](https://paystack.com)
2. Click **Get Started** and sign up
3. Verify your email address
4. Complete business verification (required for live mode)

### 2. Get Your API Keys

#### Test Mode (Development)

1. Log in to Paystack Dashboard
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Public Key** (starts with `pk_test_`)
4. Copy your **Test Secret Key** (starts with `sk_test_`)

#### Live Mode (Production)

1. Complete business verification
2. Submit business documents (CAC, ID, etc.)
3. Wait for approval (usually 1-3 business days)
4. Once approved, copy your **Live Public Key** (`pk_live_`)
5. Copy your **Live Secret Key** (`sk_live_`)

### 3. Configure Environment Variables

Add your Paystack keys to `.env`:

```env
# Test Mode
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
VITE_PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here

# Live Mode (Production)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
VITE_PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
```

**Important**:
- Never commit your `.env` file to version control
- Use test keys for development
- Switch to live keys only in production

### 4. Test Your Integration

Use Paystack test cards to verify the integration:

**Successful Payment:**
```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

**Declined Payment:**
```
Card Number: 5060 9999 9999 9999 95
CVV: 123
Expiry: Any future date
```

More test cards: [https://paystack.com/docs/testing/test-cards](https://paystack.com/docs/testing/test-cards)

## Integration Architecture

### Components

```
src/
├── lib/
│   └── paystackService.ts        # Core Paystack API integration
├── hooks/
│   └── usePayments.ts            # React Query payment hooks
└── components/
    └── payment/
        ├── PaystackButton.tsx    # Payment button component
        └── PaymentDialog.tsx     # Payment modal component
```

### Payment Flow

```
1. User creates a booking
   ↓
2. PaymentDialog displays booking details
   ↓
3. User clicks "Pay" button
   ↓
4. Paystack popup opens (PaystackButton)
   ↓
5. User completes payment on Paystack
   ↓
6. Paystack returns payment reference
   ↓
7. Backend verifies payment (verifyPayment)
   ↓
8. Transaction record created (createPaymentTransaction)
   ↓
9. Booking status updated to "confirmed"
   ↓
10. Payment receipt email sent
   ↓
11. Success notification shown
```

## Usage Examples

### Basic Payment Button

```tsx
import { PaystackButton } from '@/components/payment/PaystackButton';

<PaystackButton
  bookingId="booking-123"
  propertyId="property-456"
  customerEmail="customer@example.com"
  customerName="John Doe"
  amount={150000} // ₦150,000
  bookingNumber="BK001"
  onSuccess={() => console.log('Payment successful!')}
/>
```

### Payment Dialog (Recommended)

```tsx
import { PaymentDialog } from '@/components/payment/PaymentDialog';
import { useBooking } from '@/hooks/useBookings';

function BookingPayment() {
  const { data: booking } = useBooking(bookingId);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <Button onClick={() => setShowPayment(true)}>
        Pay Now
      </Button>

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        booking={booking}
        onPaymentSuccess={() => {
          toast.success('Booking confirmed!');
          navigate('/bookings');
        }}
      />
    </>
  );
}
```

### Initialize Payment Programmatically

```tsx
import { useInitializePayment } from '@/hooks/usePayments';

const { mutate: initPayment, isPending } = useInitializePayment();

initPayment({
  email: 'customer@example.com',
  amount: 150000,
  metadata: {
    booking_id: 'booking-123',
    property_id: 'property-456',
    booking_number: 'BK001',
  },
});
```

### Verify Payment

```tsx
import { useVerifyPayment } from '@/hooks/usePayments';

const { mutate: verifyPayment } = useVerifyPayment();

verifyPayment(paymentReference, {
  onSuccess: (data) => {
    console.log('Payment verified:', data);
  },
});
```

### Process Completed Payment

```tsx
import { useProcessPayment } from '@/hooks/usePayments';

const { mutate: processPayment } = useProcessPayment();

processPayment({
  bookingId: 'booking-123',
  propertyId: 'property-456',
  amount: 150000,
  reference: 'xyz123',
});
```

## Webhook Setup

Webhooks allow Paystack to notify your application of payment events in real-time.

### 1. Create Webhook Endpoint

Create an API endpoint to receive webhook events:

```typescript
// Example: pages/api/paystack-webhook.ts or Supabase Edge Function
import { handlePaystackWebhook, validateWebhookSignature } from '@/lib/paystackService';

export async function POST(request: Request) {
  const signature = request.headers.get('x-paystack-signature');
  const body = await request.text();

  // Validate webhook signature
  if (!validateWebhookSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);
  await handlePaystackWebhook(event);

  return new Response('OK', { status: 200 });
}
```

### 2. Configure Webhook URL in Paystack

1. Go to Paystack Dashboard → **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhook URL**
3. Enter your webhook URL: `https://yourdomain.com/api/paystack-webhook`
4. Click **Save**

### 3. Test Webhooks

Use Paystack's webhook tester in the dashboard to send test events.

### Supported Webhook Events

- `charge.success` - Payment successful
- `transfer.success` - Refund successful
- `transfer.failed` - Refund failed

## Transaction Recording

All payments are automatically recorded in the `transactions` table:

```sql
transactions {
  id: UUID
  transaction_type: 'income'
  category: 'accommodation'
  amount: DECIMAL
  payment_method: 'paystack'
  booking_id: UUID (FK)
  property_id: UUID (FK)
  description: TEXT
  reference_number: TEXT (Paystack reference)
  metadata: JSONB (Paystack response data)
  transaction_date: TIMESTAMP
}
```

### Query Payment Transactions

```tsx
import { usePaymentTransactions } from '@/hooks/usePayments';

const { data: transactions } = usePaymentTransactions();
```

### Query Booking Payments

```tsx
import { useBookingPayments } from '@/hooks/usePayments';

const { data: payments } = useBookingPayments(bookingId);
```

## Security Best Practices

### 1. API Key Security

- ✅ Store keys in environment variables
- ✅ Use test keys in development
- ✅ Never commit keys to version control
- ✅ Rotate keys if compromised
- ❌ Never expose secret key to frontend

### 2. Payment Verification

Always verify payments on the backend:

```typescript
// Frontend: Get payment reference
const reference = paystackResponse.reference;

// Backend: Verify with Paystack API
const verification = await verifyPayment(reference);
if (!verification.success) {
  throw new Error('Payment verification failed');
}
```

### 3. Webhook Validation

Always validate webhook signatures:

```typescript
if (!validateWebhookSignature(body, signature)) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 4. Amount Validation

Verify payment amount matches booking amount:

```typescript
if (paymentData.amount !== booking.total_amount * 100) {
  throw new Error('Payment amount mismatch');
}
```

## Error Handling

### Common Errors

**"Payment system not configured"**
- Missing `VITE_PAYSTACK_PUBLIC_KEY`
- Check `.env` file

**"Invalid payment amount"**
- Amount must be greater than 0
- Check booking total_amount

**"Customer information required"**
- Missing customer email or name
- Ensure booking has customer details

**"Payment verification failed"**
- Invalid reference
- Network error
- Check Paystack dashboard

**"Payment popup blocked"**
- Browser blocking popups
- Ask user to allow popups

### Error Logging

All payment errors are logged:

```typescript
console.error('Payment error:', error);
toast.error(error.message);
```

Check browser console or server logs for details.

## Testing

### Development Testing

1. Use test API keys
2. Use Paystack test cards
3. Check Paystack test dashboard
4. Verify transactions in database

### Test Scenarios

- ✅ Successful card payment
- ✅ Successful bank transfer
- ✅ Declined payment
- ✅ Cancelled payment (user closes popup)
- ✅ Network error during payment
- ✅ Payment verification failure
- ✅ Webhook event handling

### Test Checklist

- [ ] Payment popup opens correctly
- [ ] Customer information pre-filled
- [ ] Amount displayed correctly
- [ ] Successful payment creates transaction
- [ ] Booking status updated to "confirmed"
- [ ] Payment receipt email sent
- [ ] Failed payment shows error message
- [ ] Cancelled payment doesn't create transaction

## Monitoring

### Paystack Dashboard

Monitor payments in Paystack Dashboard:

- **Transactions**: View all transactions
- **Analytics**: Revenue trends, success rates
- **Disputes**: Handle chargebacks
- **Customers**: View customer payment history

### Application Logs

Check application logs for:
- Payment initialization
- Payment verification
- Transaction creation
- Error messages

### Database Queries

Query payment statistics:

```sql
-- Total revenue (Paystack payments)
SELECT SUM(amount) FROM transactions
WHERE payment_method = 'paystack'
AND transaction_type = 'income';

-- Payment success rate
SELECT
  COUNT(*) FILTER (WHERE payment_status = 'paid') * 100.0 / COUNT(*) as success_rate
FROM bookings;

-- Recent payments
SELECT * FROM transactions
WHERE payment_method = 'paystack'
ORDER BY created_at DESC
LIMIT 10;
```

## Pricing

### Paystack Fees

**Local Cards (Nigeria):**
- 1.5% + ₦100 (capped at ₦2,000)

**International Cards:**
- 3.9% + ₦100

**Bank Transfer:**
- ₦50 flat fee

**USSD:**
- ₦50 flat fee

### Fee Calculation Example

```typescript
// Booking amount: ₦150,000
const bookingAmount = 150000;

// Paystack fee: 1.5% + ₦100
const percentageFee = bookingAmount * 0.015; // ₦2,250
const fixedFee = 100;
const totalFee = Math.min(percentageFee + fixedFee, 2000); // ₦2,000 (capped)

// You receive: ₦148,000
const netAmount = bookingAmount - totalFee;
```

**Note**: Fees are deducted by Paystack before settlement.

## Going Live

### Pre-Launch Checklist

- [ ] Complete business verification
- [ ] Submit required documents
- [ ] Get live API keys approved
- [ ] Test with small transactions first
- [ ] Update environment variables to live keys
- [ ] Configure webhook URL
- [ ] Test webhook events
- [ ] Monitor first transactions closely
- [ ] Set up email alerts for failures

### Production Deployment

1. **Update Environment Variables**
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
   VITE_PAYSTACK_SECRET_KEY=sk_live_your_live_key
   ```

2. **Deploy Application**
   - Deploy to production server
   - Verify environment variables loaded
   - Test payment flow end-to-end

3. **Configure Webhook**
   - Set production webhook URL
   - Test with live webhook events

4. **Monitor Launch**
   - Watch first 10-20 transactions
   - Check for errors in logs
   - Verify transaction creation
   - Confirm email notifications

### Post-Launch

- Monitor payment success rates
- Handle customer disputes promptly
- Track revenue in Paystack dashboard
- Review and optimize checkout flow
- Collect customer feedback

## Troubleshooting

### Payment Popup Not Opening

**Problem**: Payment button clicked but nothing happens

**Solutions**:
1. Check browser console for errors
2. Verify Paystack public key is set
3. Check if browser blocking popups
4. Ensure customer email is valid
5. Verify amount is greater than 0

### Payment Verification Failing

**Problem**: Payment successful on Paystack but not verified

**Solutions**:
1. Check Paystack secret key
2. Verify reference matches
3. Check network connectivity
4. Look for API errors in Paystack dashboard
5. Try manual verification

### Transaction Not Created

**Problem**: Payment verified but no transaction in database

**Solutions**:
1. Check database connection
2. Verify booking_id and property_id exist
3. Check transaction table permissions
4. Look for SQL errors in logs
5. Verify transaction trigger not disabled

### Email Not Sent

**Problem**: Payment successful but no receipt email

**Solutions**:
1. Check Resend API key
2. Verify customer email address
3. Check email service logs
4. Verify email template loading
5. Check spam folder

## Support Resources

### Paystack

- **Website**: [https://paystack.com](https://paystack.com)
- **Documentation**: [https://paystack.com/docs](https://paystack.com/docs)
- **Support**: [https://paystack.com/support](https://paystack.com/support)
- **Status**: [https://status.paystack.com](https://status.paystack.com)

### Internal

- **Payment Service**: `/src/lib/paystackService.ts`
- **Payment Hooks**: `/src/hooks/usePayments.ts`
- **Payment Components**: `/src/components/payment/`

## Future Enhancements

1. **Split Payments**
   - Support partial payments
   - Payment plans/installments

2. **Multiple Payment Methods**
   - Cash on check-in option
   - Bank transfer with proof of payment
   - Wallet/credit system

3. **Automated Refunds**
   - Process refunds through API
   - Partial refund support
   - Refund approval workflow

4. **Payment Analytics**
   - Revenue forecasting
   - Payment method preferences
   - Conversion rate optimization

5. **Subscription Billing**
   - Recurring charges
   - Monthly/annual packages
   - Auto-renewal

6. **International Payments**
   - Multi-currency support
   - Foreign exchange handling
   - International card optimization

---

**Last Updated**: January 15, 2026
**Version**: 1.0.0
