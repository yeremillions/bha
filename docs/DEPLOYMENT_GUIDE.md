# Brooklyn Hills Apartments - Deployment Guide

## 🎉 Production-Blocking Features: COMPLETE

All 5 critical features have been successfully implemented:

✅ **Bar Management** - Full inventory and tab management system
✅ **Vendor Management** - Complete vendor and job tracking
✅ **Reports** - Comprehensive financial and operational reports
✅ **Email Notifications** - Automated transactional emails
✅ **Payment Integration** - Paystack online payment processing

---

## Pre-Deployment Checklist

### 1. Database Migrations

Apply all pending database migrations to your Supabase project:

```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or manually run migrations in Supabase Dashboard SQL Editor:
# 1. 20260113_create_financial_transactions.sql
# 2. 20260115_create_bar_tables.sql
# 3. 20260115_create_vendor_tables.sql
```

**Migration Files to Apply:**
- `/supabase/migrations/20260113_create_financial_transactions.sql`
- `/supabase/migrations/20260115_create_bar_tables.sql`
- `/supabase/migrations/20260115_create_vendor_tables.sql`

### 2. Environment Variables

Create a `.env` file (or configure in your hosting platform) with these variables:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email - Resend (Required for notifications)
VITE_RESEND_API_KEY=re_your_resend_api_key

# Payment - Paystack (Required for payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key  # Use pk_live_ in production
VITE_PAYSTACK_SECRET_KEY=sk_test_your_secret_key  # Use sk_live_ in production

# Application
VITE_APP_URL=https://yourdomain.com
VITE_APP_NAME=Brooklyn Hills Apartments
```

**How to get these keys:**

1. **Supabase**: Project Settings → API → Project URL & anon key
2. **Resend**: [https://resend.com](https://resend.com) → API Keys
3. **Paystack**: [https://paystack.com](https://paystack.com) → Settings → API Keys

### 3. External Service Setup

#### Resend (Email Service)

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your email
3. Add your domain (for production) or use test mode
4. Create API key
5. See `/docs/EMAIL_NOTIFICATIONS.md` for full setup

#### Paystack (Payment Gateway)

1. Sign up at [https://paystack.com](https://paystack.com)
2. Complete business verification (for live mode)
3. Get test keys for development
4. Get live keys for production
5. Configure webhook URL
6. See `/docs/PAYMENT_INTEGRATION.md` for full setup

### 4. Build and Test

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Test these critical flows:**
- ✅ User login/registration
- ✅ Create a booking
- ✅ Process a payment (use Paystack test cards)
- ✅ Receive email notifications
- ✅ Create bar tab and close it
- ✅ Assign vendor job
- ✅ Generate reports with date range

### 5. Scheduled Jobs Setup

For check-in reminder emails (24 hours before check-in):

**Option A: Supabase Edge Functions (Recommended)**

1. Create edge function:
```typescript
// supabase/functions/send-check-in-reminders/index.ts
import { sendCheckInReminders } from '../../../src/lib/scheduledJobs.ts';

Deno.serve(async (req) => {
  // Verify API key
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

2. Deploy:
```bash
supabase functions deploy send-check-in-reminders
```

3. Set up pg_cron:
```sql
SELECT cron.schedule(
  'send-check-in-reminders',
  '0 9 * * *',  -- Daily at 9:00 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-check-in-reminders',
    headers := '{"x-api-key": "your-secret-key"}'::jsonb
  )
  $$
);
```

**Option B: External Cron (GitHub Actions, Vercel, etc.)**

See `/docs/EMAIL_NOTIFICATIONS.md` for alternative setups.

### 6. Webhook Configuration

**Paystack Webhook:**

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Enter webhook URL: `https://yourdomain.com/api/paystack-webhook`
3. Create the webhook handler (see `/docs/PAYMENT_INTEGRATION.md`)
4. Test webhook with Paystack's test tool

---

## Deployment Steps

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_RESEND_API_KEY
vercel env add VITE_PAYSTACK_PUBLIC_KEY
vercel env add VITE_PAYSTACK_SECRET_KEY

# Deploy to production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Add environment variables in Netlify dashboard
# Site Settings → Environment Variables

# Deploy to production
netlify deploy --prod
```

### Deploy to Custom Server

```bash
# Build
npm run build

# Upload dist/ folder to your server
scp -r dist/* user@server:/var/www/html/

# Configure nginx/apache to serve the static files
# Set up environment variables on server
```

---

## Post-Deployment Verification

### 1. Smoke Tests

After deployment, verify these critical paths:

**User Flow:**
- [ ] Can access the application
- [ ] Can log in / register
- [ ] Can view available properties
- [ ] Can create a booking
- [ ] Can make a payment (test mode)
- [ ] Receives confirmation email
- [ ] Can view booking details

**Admin Flow:**
- [ ] Can access admin dashboard
- [ ] Can manage properties
- [ ] Can view all bookings
- [ ] Can manage bar inventory
- [ ] Can assign vendor jobs
- [ ] Can generate reports
- [ ] Can view transactions

### 2. Email Delivery Test

```bash
# Check Resend dashboard
# - Look for sent emails
# - Verify delivery status
# - Check spam score
```

### 3. Payment Test

Use Paystack test cards (see `/docs/PAYMENT_INTEGRATION.md`):

**Success:**
- Card: 4084 0840 8408 4081
- Verify payment processed
- Check transaction created
- Verify booking confirmed
- Check email sent

**Decline:**
- Card: 5060 9999 9999 9999 95
- Verify graceful error handling
- Check user sees error message
- Verify no transaction created

### 4. Database Verification

Check that all tables have data:

```sql
-- Sample data should exist
SELECT COUNT(*) FROM bar_items;      -- Should be ~22
SELECT COUNT(*) FROM vendors;        -- Should be ~8
SELECT COUNT(*) FROM bookings;       -- Check existing bookings
SELECT COUNT(*) FROM transactions;   -- Check financial records
```

### 5. Monitoring Setup

**Supabase Dashboard:**
- Monitor database performance
- Check API usage
- Review error logs
- Set up alerts

**Resend Dashboard:**
- Monitor email delivery
- Track open/click rates
- Check bounce rates

**Paystack Dashboard:**
- Monitor transactions
- Track payment success rate
- Handle disputes
- Review settlement reports

---

## Going Live Checklist

### Switch to Production Mode

1. **Paystack Live Keys**
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
   VITE_PAYSTACK_SECRET_KEY=sk_live_your_live_key
   ```

2. **Resend Domain Verification**
   - Add your domain to Resend
   - Configure DNS records
   - Update sender email in `/src/lib/emailService.ts`

3. **Supabase Production Settings**
   - Review RLS policies
   - Enable connection pooling
   - Set up backups
   - Configure auth providers

### Security Checklist

- [ ] All API keys in environment variables (not in code)
- [ ] `.env` file not committed to git
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enforced
- [ ] Webhook signatures validated
- [ ] Payment amounts verified server-side
- [ ] Rate limiting configured
- [ ] Error messages don't expose sensitive data

### Performance Optimization

- [ ] Enable Supabase connection pooling
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Enable React Query caching
- [ ] Set up monitoring (Sentry, LogRocket)

---

## Rollback Plan

If issues arise after deployment:

1. **Revert to Previous Version**
   ```bash
   git revert HEAD
   git push
   vercel --prod  # or your deployment command
   ```

2. **Database Rollback**
   - Supabase automatically creates backups
   - Restore from backup if needed
   - Supabase Dashboard → Database → Backups

3. **Switch Back to Test Mode**
   - Use Paystack test keys
   - Use Resend test mode
   - Disable scheduled jobs

---

## Support and Monitoring

### Health Checks

Create a health check endpoint:

```typescript
// /api/health
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    email: await checkEmailService(),
    payment: await checkPaymentService(),
  };

  return new Response(JSON.stringify(checks), {
    status: checks.database && checks.email && checks.payment ? 200 : 500,
  });
}
```

### Monitoring Dashboards

**Supabase:**
- Database: CPU, Memory, Connections
- API: Request rate, Error rate
- Auth: Login success rate

**Resend:**
- Delivery rate
- Bounce rate
- Spam score

**Paystack:**
- Transaction volume
- Success rate
- Settlement status

### Error Tracking

Integrate error tracking (optional but recommended):

```bash
# Sentry
npm install @sentry/react

# Configure in main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE,
});
```

---

## Maintenance Schedule

### Daily
- [ ] Check email delivery status
- [ ] Monitor payment transactions
- [ ] Review error logs
- [ ] Check critical alerts

### Weekly
- [ ] Review booking trends
- [ ] Analyze payment success rates
- [ ] Check vendor job status
- [ ] Review customer feedback

### Monthly
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Dependency updates (npm audit)

---

## Documentation References

- **Email System**: `/docs/EMAIL_NOTIFICATIONS.md`
- **Payment System**: `/docs/PAYMENT_INTEGRATION.md`
- **Project Plan**: `/UPDATED_PROJECT_COMPLETION_PLAN.md`
- **Action Plan**: `/ACTION_PLAN.md`
- **Quick Reference**: `/QUICK_REFERENCE.md`

---

## Emergency Contacts

**Service Status Pages:**
- Supabase: [https://status.supabase.com](https://status.supabase.com)
- Resend: [https://resend.com/status](https://resend.com/status)
- Paystack: [https://status.paystack.com](https://status.paystack.com)

**Support:**
- Supabase: [https://supabase.com/support](https://supabase.com/support)
- Resend: [https://resend.com/support](https://resend.com/support)
- Paystack: [https://paystack.com/support](https://paystack.com/support)

---

## Next Steps After Deployment

1. **User Acceptance Testing (UAT)**
   - Test with real users
   - Collect feedback
   - Fix critical issues

2. **Marketing Launch**
   - Announce to customers
   - Social media promotion
   - Email campaign to existing users

3. **Feature Enhancements**
   - See `/UPDATED_PROJECT_COMPLETION_PLAN.md` for remaining features
   - Prioritize based on user feedback
   - Plan next sprint

4. **Performance Tuning**
   - Monitor real usage patterns
   - Optimize slow queries
   - Improve caching
   - Scale infrastructure

---

**Congratulations!** 🎉

All production-blocking features are implemented and ready for deployment.

---

**Last Updated**: January 15, 2026
**Version**: 1.0.0
**Status**: Ready for Production
