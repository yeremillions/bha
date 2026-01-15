# Brooklyn Hills Apartments - Immediate Action Plan

**Date:** January 15, 2026
**Goal:** Production-ready booking system in 2-3 weeks

---

## 🎯 Critical Path to Launch

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION LAUNCH                         │
│                          ↑                                   │
│              ┌───────────┴───────────┐                       │
│              │                       │                       │
│      ┌───────▼───────┐      ┌───────▼────────┐             │
│      │   Payment     │      │     Email      │             │
│      │  Integration  │      │ Notifications  │             │
│      │  (5 days)     │      │   (3-4 days)   │             │
│      └───────┬───────┘      └───────┬────────┘             │
│              │                       │                       │
│              └───────────┬───────────┘                       │
│                          │                                   │
│                  ┌───────▼────────┐                         │
│                  │   Testing &    │                         │
│                  │   Hardening    │                         │
│                  │   (3-4 days)   │                         │
│                  └────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Sprint 1: Payment Integration (Week 1)

### Day 1-2: Setup & Infrastructure
**Priority:** 🔴 CRITICAL

#### Tasks:
- [ ] Install Paystack SDK: `npm install @paystack/inline-js`
- [ ] Store Paystack keys in Supabase secrets (not in code!)
  ```bash
  # Staging keys
  PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
  PAYSTACK_SECRET_KEY=sk_test_xxxxx
  ```
- [ ] Create Supabase Edge Function for payment initialization
  ```bash
  supabase functions new initialize-payment
  supabase functions new payment-webhook
  ```
- [ ] Set up webhook endpoint in Paystack dashboard

**Files to Create:**
```
supabase/functions/
  ├── initialize-payment/
  │   └── index.ts
  └── payment-webhook/
      └── index.ts

src/components/payment/
  ├── PaystackPayment.tsx
  └── PaymentModal.tsx

src/hooks/
  └── usePayment.ts

src/lib/
  └── paymentService.ts
```

---

### Day 3-4: Payment Flow Implementation

#### Tasks:
- [ ] Create `PaystackPayment.tsx` component
  - Initialize payment with customer and booking details
  - Open Paystack inline modal
  - Handle success callback
  - Handle failure callback

- [ ] Create `usePayment.ts` hook
  ```typescript
  // Key functions:
  - initializePayment(bookingId, amount)
  - verifyPayment(reference)
  - recordTransaction(paymentData)
  - handlePaymentSuccess(reference)
  - handlePaymentFailure(error)
  ```

- [ ] Integrate payment button into `BookingDetails.tsx`
  - Show "Pay Now" button for pending bookings
  - Display payment status
  - Show payment history
  - Allow partial payments

- [ ] Update transactions table on payment
  ```sql
  INSERT INTO transactions (
    booking_id,
    customer_id,
    transaction_type,
    amount,
    payment_method,
    payment_reference,
    status
  ) VALUES (...)
  ```

---

### Day 5: Webhook & Testing

#### Tasks:
- [ ] Implement webhook handler
  ```typescript
  // payment-webhook/index.ts
  - Verify webhook signature
  - Parse webhook payload
  - Update booking payment status
  - Record transaction
  - Trigger confirmation email
  - Handle refund webhooks
  ```

- [ ] Update booking status on payment
  ```typescript
  // Auto-transition: pending → confirmed (on full payment)
  // Or: pending → pending (on partial payment)
  ```

- [ ] Test payment flow
  - [ ] Test successful payment
  - [ ] Test failed payment
  - [ ] Test partial payment
  - [ ] Test refund flow
  - [ ] Test webhook delivery
  - [ ] Test duplicate webhook handling

- [ ] Add error handling
  - Payment timeout
  - Network failure
  - Invalid card
  - Insufficient funds
  - Retry logic

**Testing Checklist:**
```
Payment Flow Tests:
✓ Full payment succeeds
✓ Partial payment records correctly
✓ Failed payment doesn't update booking
✓ Webhook updates booking status
✓ Receipt is generated
✓ Transaction is recorded
✓ Customer sees payment confirmation
✓ Admin sees payment in transactions list
✓ Refund calculation is correct
✓ Cancellation triggers refund
```

---

## 📋 Sprint 2: Email Notifications (Week 2)

### Day 1: Email Service Setup

#### Tasks:
- [ ] Choose email provider (Recommended: **Resend**)
  - Free: 3,000 emails/month
  - Easy integration
  - High deliverability
  - Or use Supabase Edge Functions + SendGrid

- [ ] Install email SDK
  ```bash
  npm install resend
  # Or
  npm install @sendgrid/mail
  ```

- [ ] Store API keys in Supabase secrets
  ```bash
  RESEND_API_KEY=re_xxxxx
  # Or
  SENDGRID_API_KEY=SG.xxxxx
  ```

- [ ] Create email service
  ```typescript
  // src/lib/emailService.ts
  - sendBookingConfirmation(booking, customer)
  - sendPaymentReceipt(transaction, booking)
  - sendCheckInReminder(booking)
  - sendCheckOutReminder(booking)
  - sendCancellationEmail(booking, refundAmount)
  ```

**Files to Create:**
```
supabase/functions/
  └── send-email/
      └── index.ts

src/lib/
  ├── emailService.ts
  └── emailTemplates.ts

src/hooks/
  └── useEmailService.ts
```

---

### Day 2: Email Templates

#### Tasks:
- [ ] Fetch templates from settings table
  ```typescript
  const { data: templates } = await supabase
    .from('settings')
    .select('email_templates')
    .single();
  ```

- [ ] Implement variable replacement
  ```typescript
  function replaceVariables(template: string, data: any) {
    return template
      .replace(/{{guestName}}/g, data.guestName)
      .replace(/{{checkInDate}}/g, data.checkInDate)
      .replace(/{{checkOutDate}}/g, data.checkOutDate)
      .replace(/{{propertyName}}/g, data.propertyName)
      .replace(/{{bookingNumber}}/g, data.bookingNumber)
      .replace(/{{totalAmount}}/g, data.totalAmount)
      // ... more variables
  }
  ```

- [ ] Create HTML email templates
  - Booking confirmation template
  - Payment receipt template
  - Check-in reminder template
  - Cancellation confirmation template

- [ ] Add plain text fallback

---

### Day 3-4: Email Integration & Triggers

#### Tasks:
- [ ] **Booking Confirmation Email**
  - Trigger: After booking creation
  - Content: Booking details, property info, check-in instructions
  - Attach: Booking summary PDF (optional)

- [ ] **Payment Receipt Email**
  - Trigger: After successful payment
  - Content: Payment amount, method, reference, receipt number
  - Attach: Receipt PDF

- [ ] **Check-in Reminder**
  - Trigger: 24 hours before check-in (use Supabase cron job)
  - Content: Reminder with check-in time, property address, contact info

- [ ] **Cancellation Confirmation**
  - Trigger: After booking cancellation
  - Content: Cancellation details, refund amount, refund timeline

- [ ] Create email logging system
  ```sql
  CREATE TABLE public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES bookings(id),
    customer_email text NOT NULL,
    email_type text NOT NULL,
    subject text,
    status text DEFAULT 'pending',
    sent_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
  );
  ```

- [ ] Implement email queue for failed sends

**Email Triggers:**
```typescript
// In booking creation:
await createBooking(bookingData);
await sendBookingConfirmation(booking);

// In payment success webhook:
await updateBookingPayment(bookingId, payment);
await sendPaymentReceipt(transaction);

// In cancellation:
await cancelBooking(bookingId);
await sendCancellationEmail(booking, refund);
```

---

## 📋 Sprint 3: Testing & Hardening (Week 2-3)

### Day 1: End-to-End Testing

#### Critical Flows to Test:
- [ ] **Complete Booking Flow**
  1. User browses available properties
  2. Selects property and dates
  3. Enters guest information
  4. Creates booking (status: pending)
  5. Receives booking confirmation email
  6. Makes payment via Paystack
  7. Payment webhook updates booking (status: confirmed)
  8. Receives payment receipt email
  9. Admin sees booking in dashboard
  10. 24h before: receives check-in reminder
  11. Check-in: status updates to checked_in
  12. Check-out: status updates to completed

- [ ] **Walk-in Booking Flow**
  1. Admin creates walk-in booking
  2. Customer info captured without account
  3. Payment processed (cash or card)
  4. Booking confirmed
  5. Email sent to customer

- [ ] **Cancellation Flow**
  1. Admin cancels booking
  2. Refund calculated based on policy
  3. Refund processed through Paystack
  4. Cancellation email sent
  5. Transaction recorded

- [ ] **Failed Payment Flow**
  1. Payment attempt fails
  2. Error message shown to user
  3. Booking remains in pending state
  4. Transaction logged as failed
  5. User can retry payment

---

### Day 2: Mobile Testing

#### Devices to Test:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad/Android)

#### Pages to Test:
- [ ] Landing page
- [ ] Property listing
- [ ] Property details
- [ ] Booking form
- [ ] Payment modal
- [ ] Dashboard (admin)
- [ ] All admin tables
- [ ] Calendar view
- [ ] Navigation menu

**Mobile Checklist:**
```
✓ All text is readable (not too small)
✓ Buttons are tappable (not too small)
✓ Forms are easy to fill on mobile
✓ Payment modal works on mobile
✓ Tables convert to cards on mobile
✓ Images load optimized sizes
✓ Navigation menu is accessible
✓ No horizontal scrolling
✓ Fast load times (< 3s)
```

---

### Day 3: Security Audit

#### Security Checklist:
- [ ] **Database Security**
  - [ ] All tables have RLS policies
  - [ ] Admins can access all records
  - [ ] Customers can only see their own bookings
  - [ ] Public can only view available properties
  - [ ] No sensitive data exposed via RLS bypass

- [ ] **API Security**
  - [ ] Supabase anon key is safe to expose (yes, it's designed for client use)
  - [ ] Service role key is NEVER in frontend code
  - [ ] Paystack secret key stored in Edge Functions only
  - [ ] Webhook signatures are verified
  - [ ] No SQL injection vulnerabilities

- [ ] **Authentication**
  - [ ] Password requirements enforced
  - [ ] Email verification enabled
  - [ ] Session expiry configured
  - [ ] Role-based access control working
  - [ ] No unauthorized access to admin routes

- [ ] **Data Validation**
  - [ ] All user inputs validated on client
  - [ ] All user inputs validated on server (via RLS)
  - [ ] Price calculations verified server-side
  - [ ] Date ranges validated (check-out > check-in)
  - [ ] Payment amounts match booking totals

- [ ] **GDPR Compliance**
  - [ ] Customer data can be exported
  - [ ] Customer data can be deleted
  - [ ] Privacy policy in place
  - [ ] Terms of service in place

---

### Day 4: Performance Optimization

#### Performance Checklist:
- [ ] **Images**
  - [ ] All images compressed
  - [ ] Lazy loading enabled
  - [ ] Responsive images (srcset)
  - [ ] WebP format where supported

- [ ] **Code Splitting**
  - [ ] Routes are lazy loaded
  - [ ] Heavy components code-split
  - [ ] Bundle size analyzed
  - [ ] Unused dependencies removed

- [ ] **Database**
  - [ ] Indexes on common query fields
  - [ ] Pagination on all lists
  - [ ] Queries optimized (no N+1)
  - [ ] React Query cache configured

- [ ] **Loading States**
  - [ ] Skeleton loaders everywhere
  - [ ] Optimistic updates where applicable
  - [ ] Error boundaries in place
  - [ ] Retry logic for failed requests

**Performance Targets:**
```
Lighthouse Scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

Page Load Times:
- Landing page: < 2s
- Dashboard: < 2.5s
- Property listing: < 2s
- Payment modal: < 1s
```

---

## 📋 Post-Launch: Bar Management (Week 4)

### Day 1-2: Database & Hooks

#### Tasks:
- [ ] Create database migration
  ```bash
  # Create file: supabase/migrations/20260115_create_bar_tables.sql
  - bar_items table
  - bar_tabs table
  - bar_tab_items table
  - RLS policies
  - Indexes
  ```

- [ ] Create data hooks
  ```typescript
  // src/hooks/useBarItems.ts
  - useBarItems() - list all items
  - useBarItem(id) - get single item
  - useCreateBarItem() - add new item
  - useUpdateBarItem() - update item
  - useDeleteBarItem() - delete item
  - useBarItemsByCategory() - filter by category

  // src/hooks/useBarTabs.ts
  - useBarTabs() - list tabs
  - useOpenTabs() - filter open tabs
  - useCreateTab() - open new tab
  - useCloseTab() - close and pay tab
  - useAddItemToTab() - add item to tab
  - useRemoveItemFromTab() - remove item
  ```

- [ ] Run migration
  ```bash
  supabase db push
  ```

---

### Day 3: Replace Mock Data

#### Tasks:
- [ ] Update `Bar.tsx`
  - Replace `mockTabs` (line 57) with `useBarTabs()`
  - Replace `mockSales` (line 65) with `useBarTabItems()`
  - Replace `mockInventory` (line 73) with `useBarItems()`

- [ ] Update stat cards with real data
  ```typescript
  const { data: todayRevenue } = useBarRevenueToday();
  const { data: openTabs } = useOpenTabs();
  const { data: itemsSold } = useItemsSoldToday();
  const { data: lowStock } = useLowStockItems();
  ```

- [ ] Connect filters to database
  - Status filter (open/closed/all)
  - Date range filter
  - Search by guest name
  - Category filter for inventory

---

### Day 4-5: Tab Workflow & Testing

#### Tasks:
- [ ] **Open Tab Workflow**
  1. Click "New Tab"
  2. Select customer (from bookings)
  3. Generate tab number (TAB001, TAB002...)
  4. Link to booking (optional)
  5. Tab created with status: open

- [ ] **Add Items to Tab**
  1. Search bar items
  2. Select item
  3. Enter quantity
  4. Add to tab
  5. Stock deducted
  6. Subtotal updated

- [ ] **Close Tab Workflow**
  1. Review tab items
  2. Calculate tax
  3. Show total
  4. Select payment method
  5. Process payment
  6. Generate receipt
  7. Record transaction
  8. Update tab status: closed

- [ ] **Low Stock Alerts**
  ```typescript
  // When item.stock_quantity <= item.min_stock_level
  - Show warning badge
  - Send notification to admin
  - Prevent sales if stock = 0
  ```

- [ ] **Integrate into Dashboard**
  - Add bar revenue to today's stats
  - Show low stock items in alerts
  - Display top-selling items

**Testing:**
```
Bar Management Tests:
✓ Create bar item
✓ Update item price
✓ Delete item
✓ Open new tab
✓ Add items to tab
✓ Remove item from tab
✓ Close tab with payment
✓ Stock deduction on sale
✓ Low stock alert triggered
✓ Tab linked to booking
✓ Receipt generated
✓ Revenue added to dashboard
```

---

## 📋 Post-Launch: Vendor Management (Week 5)

### Tasks:
- [ ] Create vendor database tables
- [ ] Create hooks (`useVendors`, `useVendorJobs`)
- [ ] Replace mock data in `Vendors.tsx`
- [ ] Implement vendor CRUD
- [ ] Link vendors to maintenance issues
- [ ] Track job costs and completion
- [ ] Vendor performance ratings

---

## 📋 Post-Launch: Reports (Week 5)

### Tasks:
- [ ] Implement report generation in `Reports.tsx`
- [ ] Monthly revenue report
- [ ] Occupancy report
- [ ] Customer analytics
- [ ] Property performance comparison
- [ ] Export to CSV/PDF
- [ ] Financial charts

---

## 🎯 Definition of Done

### For Each Task:
- [ ] Code written and tested locally
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Loading states added
- [ ] Error handling implemented
- [ ] Toast notifications for user feedback
- [ ] Database queries optimized
- [ ] RLS policies verified
- [ ] Committed to git with clear message

### For Each Sprint:
- [ ] All sprint tasks completed
- [ ] End-to-end testing passed
- [ ] No critical bugs
- [ ] Deployed to staging
- [ ] Stakeholder demo completed
- [ ] Documentation updated

### For Production Launch:
- [ ] All critical features working
- [ ] Payment processing tested thoroughly
- [ ] Email notifications working
- [ ] Mobile testing completed
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Backup system configured
- [ ] Monitoring set up
- [ ] Domain configured
- [ ] SSL enabled
- [ ] User manual created
- [ ] Launch announcement ready

---

## 📞 Daily Standup Questions

Ask yourself each day:
1. What did I complete yesterday?
2. What am I working on today?
3. What's blocking me?
4. Am I on track for the sprint goal?

---

## 🚨 Escalation Path

If you encounter blockers:
1. **Payment issues:** Consult Paystack documentation and support
2. **Email delivery issues:** Check Resend/SendGrid logs
3. **Database performance:** Review query plans, add indexes
4. **Security concerns:** Consult Supabase RLS documentation
5. **Design questions:** Refer to existing UI patterns in project

---

## 📦 Deployment Checklist

### Staging Deployment:
- [ ] Push code to staging branch
- [ ] Run database migrations
- [ ] Test payment flow (test mode)
- [ ] Test email delivery
- [ ] Verify all features work
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit

### Production Deployment:
- [ ] Merge staging to main
- [ ] Run production migrations
- [ ] Switch Paystack to live mode
- [ ] Update environment variables
- [ ] Test payment with real card (small amount)
- [ ] Verify email delivery
- [ ] Monitor error logs
- [ ] Announce launch

---

## 📊 Progress Tracking

### Week 1:
```
Day 1: [▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░] 50% - Payment setup
Day 2: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░] 75% - Payment integration
Day 3: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░] 85% - Payment flow
Day 4: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░] 95% - Testing
Day 5: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% - Webhook complete
```

### Week 2:
```
Day 1: [▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░] 50% - Email setup
Day 2: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░] 75% - Templates
Day 3: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░] 85% - Integration
Day 4: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% - Testing
```

### Week 3:
```
Day 1: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░] 75% - E2E testing
Day 2: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░] 85% - Mobile testing
Day 3: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░] 95% - Security audit
Day 4: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% - Production ready!
```

---

**Remember:** The project is already 65-75% complete. You're building the final critical pieces to launch a production-ready system!

**Stay Focused On:** Payment Integration → Email Notifications → Launch

**Everything else can wait!**
