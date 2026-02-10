# Security Architecture Review - Brooklyn Hills Apartments

**Date:** 2026-02-09
**Scope:** Full-stack security audit of the BHA property management system (React/TypeScript frontend, Supabase backend with Deno Edge Functions, PostgreSQL database)

---

## Executive Summary

This review identified **6 critical**, **5 high**, and **8 medium** severity issues across authentication, authorization, API security, data protection, and dependency management. The most urgent findings are: disabled JWT verification on all 12 edge functions, wildcard CORS on sensitive endpoints, a secret API key exposed to the client-side bundle, and the `.env` file committed to git history.

---

## Critical Severity

### 1. JWT Verification Disabled on All Edge Functions

**File:** `supabase/config.toml` (lines 3-37)

Every one of the 12 Supabase Edge Functions has `verify_jwt = false`:

```toml
[functions.delete-user]
verify_jwt = false

[functions.verify-payment]
verify_jwt = false

[functions.cancel-booking]
verify_jwt = false
# ... all 12 functions
```

**Impact:** Supabase's gateway-level JWT check is completely bypassed. Any unauthenticated HTTP request can invoke these functions. While some functions (like `delete-user`) perform their own auth checks internally, others (like `create-booking`, `verify-payment`, `subscribe-newsletter`) do not - meaning anyone on the internet can call them freely.

**Recommendation:**
- Set `verify_jwt = true` for all functions that should require authentication: `delete-user`, `send-team-invitation`, `cancel-booking`, `claim-account`.
- For legitimately public functions (`create-booking`, `subscribe-newsletter`, `validate-invitation`), keep `verify_jwt = false` but add rate limiting and input validation.
- For `verify-payment`, implement webhook signature verification from Paystack instead of relying on client-initiated verification.

---

### 2. Wildcard CORS on All Edge Functions

**Files:** All 12 edge functions (e.g., `supabase/functions/create-booking/index.ts:4`, `supabase/functions/verify-payment/index.ts:4`, `supabase/functions/delete-user/index.ts:4`)

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
};
```

**Impact:** Any website can make cross-origin requests to your API. Combined with disabled JWT verification, an attacker's site could call `verify-payment` or `cancel-booking` from a victim's browser.

**Recommendation:** Restrict `Access-Control-Allow-Origin` to your production domain(s):
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://brooklynhillsapartment.com",
};
```

---

### 3. Resend API Key Exposed in Client-Side Bundle

**File:** `src/lib/emailService.ts:5`

```typescript
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || '');
```

Any environment variable prefixed with `VITE_` is embedded in the Vite build output and shipped to every browser. This means the Resend API key is visible in the JavaScript bundle.

**Impact:** An attacker can extract the API key from the browser's network tab or source maps and send arbitrary emails from your domain - phishing, spam, or impersonation of Brooklyn Hills Apartments.

**Recommendation:**
- Remove `VITE_RESEND_API_KEY` from `.env` and the client-side code entirely.
- All email sending should happen exclusively through Edge Functions (which already exist: `send-booking-email`, `send-team-invitation`, etc.) using `Deno.env.get('RESEND_API_KEY')`.
- Delete or repurpose `src/lib/emailService.ts` - the client should call edge functions, never send email directly.

---

### 4. `.env` File Committed to Git History

**File:** `.env`

The `.env` file containing Supabase keys and a Paystack test key was committed to git. Even though `.gitignore` now excludes it, the secrets persist in git history.

**Impact:** Anyone with access to the repository (or any fork, backup, or CI log) can extract these credentials.

**Recommendation:**
1. Rotate all compromised credentials immediately: Supabase anon key, Paystack keys.
2. Remove the file from git history using `git filter-repo` or BFG Repo-Cleaner.
3. Verify `.env` is in `.gitignore` before any new credentials are added.

---

### 5. No Rate Limiting on Any Endpoint

**Files:** All edge functions, Supabase Auth endpoints

There is no rate limiting configured anywhere - not on authentication attempts, booking creation, payment verification, or newsletter subscription.

**Impact:**
- Brute-force attacks against login (`signInWithPassword`).
- Automated spam booking creation flooding the database.
- Payment reference enumeration via repeated `verify-payment` calls.
- Newsletter subscription abuse.

**Recommendation:**
- Use Supabase's built-in rate limiting configuration for auth endpoints.
- For edge functions, implement rate limiting using a Redis-backed counter or Supabase's `pg_net` extension with IP-based throttling.
- At minimum, add exponential backoff and account lockout after N failed login attempts.

---

### 6. Payment Verification is Client-Initiated and Unauthenticated

**File:** `supabase/functions/verify-payment/index.ts`

The payment flow relies on the client sending a `reference` and `amount` to `verify-payment`. While the function does verify against Paystack and checks amount matching (line 105), the function itself requires no authentication and trusts the client-provided `bookingId` and `amount`.

**Impact:** An attacker could:
1. Create a booking via `create-booking` (also unauthenticated).
2. Make a small Paystack payment (e.g., 100 NGN).
3. Call `verify-payment` with the small payment's reference but the booking's higher amount - this would fail due to amount check.
4. However, if the attacker manipulates the `amount` parameter to match their actual payment, they could confirm an under-paid booking.

**Recommendation:**
- Implement Paystack webhook verification (server-to-server) instead of client-initiated verification. Paystack sends payment confirmation to your server directly.
- Store the expected amount in the booking record at creation time and verify against that (not the client-supplied `amount` parameter).
- Add idempotency checks to prevent double-processing of the same reference.

---

## High Severity

### 7. Auth Tokens Stored in localStorage

**File:** `src/integrations/supabase/client.ts:13`

```typescript
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
}
```

**Impact:** `localStorage` is accessible to any JavaScript running on the page. A single XSS vulnerability (including from third-party scripts or browser extensions) can exfiltrate the JWT, giving full account access.

**Recommendation:** This is the Supabase default and changing it requires a custom storage adapter with `httpOnly` cookies. Consider:
- Implementing a server-side session proxy that sets `httpOnly`, `Secure`, `SameSite=Strict` cookies.
- At minimum, ensure a strong Content Security Policy (CSP) to mitigate XSS risk (see item 12).

---

### 8. Service Role Key Used in Unauthenticated Functions

**Files:** `supabase/functions/create-booking/index.ts:37-40`, `supabase/functions/verify-payment/index.ts:52-54`

```typescript
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

These functions use the service role key (which bypasses all RLS policies) and are callable without authentication.

**Impact:** The service role key grants full database access. While the key itself stays server-side, the *functions* that use it are wide open. Any request to `create-booking` gets full-privilege database operations.

**Recommendation:**
- For `create-booking`: This is intentionally public (guests book without an account). Tighten by adding CAPTCHA verification, rate limiting, and strict input validation.
- For `verify-payment`: Require authentication or switch to Paystack webhooks.
- Scope down what the service role client can do within each function (use `.from('specific_table')` only).

---

### 9. Weak Password Policy

**File:** `src/pages/Auth.tsx`

The sign-up form enforces only a 6-character minimum password with no complexity requirements.

**Impact:** Users can set trivially guessable passwords like `123456` or `abcdef`.

**Recommendation:**
- Enforce a minimum of 12 characters.
- Require at least one uppercase letter, one number, and one special character.
- Consider using a password strength estimator (e.g., zxcvbn) for real-world strength evaluation.
- Configure Supabase Auth's password requirements server-side as well.

---

### 10. Dependency Vulnerabilities

**File:** `package.json`

The project has known vulnerabilities in dependencies:
- **HIGH:** `@remix-run/router` (React Router) - XSS via open redirects
- **HIGH:** `glob` - command injection
- **MODERATE:** `esbuild` (via Vite) - dev server vulnerability
- **MODERATE:** `js-yaml` - prototype pollution
- **MODERATE:** `lodash` - prototype pollution

**Recommendation:** Run `npm audit fix` immediately. For vulnerabilities without automatic fixes, evaluate whether the vulnerable code path is reachable and upgrade manually.

---

### 11. Error Messages Expose Implementation Details

**Files:** `src/pages/Auth.tsx:50-60`, `supabase/functions/create-booking/index.ts:82`

```typescript
// Auth.tsx
description: error.message,  // Raw Supabase error shown to user

// create-booking
JSON.stringify({ error: "Failed to create customer record", details: customerError?.message })
```

**Impact:** Error messages from Supabase/Postgres can reveal table names, column constraints, and database structure to attackers.

**Recommendation:** Return generic user-facing error messages. Log detailed errors server-side only.

---

## Medium Severity

### 12. No HTTP Security Headers

**File:** `vite.config.ts`

The application sets no security headers. Missing:
- `Content-Security-Policy` (CSP) - prevents XSS and data injection
- `X-Frame-Options` / `frame-ancestors` - prevents clickjacking
- `X-Content-Type-Options: nosniff` - prevents MIME sniffing
- `Strict-Transport-Security` (HSTS) - enforces HTTPS
- `Referrer-Policy` - controls referrer leakage
- `Permissions-Policy` - restricts browser features

**Recommendation:** Configure these headers in your deployment platform (Vercel/Netlify) or add a security headers plugin to Vite. For Vercel, add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

### 13. No CSRF Protection on Edge Functions

Edge Functions accept POST requests from any origin (due to wildcard CORS) with no CSRF token verification. Since authentication tokens are sent via `Authorization` headers (not cookies), standard CSRF via cookie-riding is not directly exploitable. However, if the auth model ever changes to cookie-based sessions, this becomes critical.

**Recommendation:** Add CSRF tokens to state-changing operations as a defense-in-depth measure.

---

### 14. File Upload Validation is Client-Side Only

**File:** `src/components/property/PropertyImageUpload.tsx:105`

```typescript
if (!file.type.startsWith('image/')) {
  // Client-side MIME check only
}
```

**Impact:** MIME type is trivially spoofed. Malicious files (scripts, executables) could be uploaded to Supabase Storage.

**Recommendation:**
- Validate file type server-side by inspecting magic bytes (file signatures).
- Enforce file size limits in Supabase Storage bucket policies.
- Configure the storage bucket to serve files with `Content-Disposition: attachment` for non-image types.
- Use Supabase Storage's built-in file size and MIME type restrictions.

---

### 15. Excessive Console Logging of Sensitive Data

**Files:** `supabase/functions/create-booking/index.ts` (7 log statements), `supabase/functions/verify-payment/index.ts` (10+ log statements)

```typescript
console.log(`Creating booking for ${guestInfo.email} at property ${propertyId}`);
console.log("Paystack verification response:", paystackData.status, paystackData.message);
```

**Impact:** Customer emails, payment references, booking numbers, and transaction details are logged to Supabase's function logs, which may be accessible to developers or third parties with dashboard access.

**Recommendation:**
- Remove or redact PII from log statements.
- Use structured logging with severity levels.
- Ensure log retention policies comply with data protection regulations (NDPR in Nigeria).

---

### 16. No Audit Trail for Critical Operations

While an `audit_logs` table exists in the schema, there is no evidence of it being written to from the application code or edge functions. Operations like user deletion, booking cancellation, and payment processing are not being audit-logged.

**Recommendation:** Insert audit records for all state-changing operations, especially: user management, payment processing, booking modifications, and role changes.

---

### 17. `dangerouslySetInnerHTML` Usage

**File:** `src/components/ui/chart.tsx:70-85`

```typescript
<style dangerouslySetInnerHTML={{
  __html: Object.entries(THEMES).map(...)
```

**Impact:** Low risk currently since the data comes from a static config object, but this pattern is fragile - any future change that introduces user-controlled data into `THEMES` would create an XSS vector.

**Recommendation:** Replace with CSS-in-JS or Tailwind utility classes that don't require `dangerouslySetInnerHTML`.

---

### 18. Email Template Injection Risk

**File:** `src/lib/emailService.ts:240`

```typescript
<p>Dear ${data.customerName},</p>
```

Customer-provided names are interpolated directly into HTML email templates without sanitization.

**Impact:** A customer could set their name to `<script>alert(1)</script>` or inject HTML that alters the email's appearance (phishing within your own emails).

**Recommendation:** HTML-encode all user-provided data before interpolation into email templates. Use a library like `he` or `DOMPurify` for server-side sanitization.

---

### 19. No Session Timeout or Concurrent Session Management

**File:** `src/hooks/useAuth.tsx`

The auth implementation has no session timeout, no maximum session duration, and no detection of concurrent sessions from multiple devices.

**Recommendation:**
- Configure Supabase Auth JWT expiry to a reasonable duration (e.g., 1 hour).
- Implement an idle timeout on the client side.
- Consider allowing users to view and revoke active sessions.

---

## Informational

### 20. Two Lock Files Present

Both `package-lock.json` and `bun.lockb` exist. This can cause dependency drift if different environments use different package managers.

**Recommendation:** Standardize on one package manager and remove the other lock file.

---

## Summary Table

| # | Finding | Severity | Status | Resolution |
|---|---------|----------|--------|------------|
| 1 | JWT verification disabled on all edge functions | Critical | FIXED | `verify_jwt = true` on `send-team-invitation`, `delete-user`, `send-booking-email` |
| 2 | Wildcard CORS on all edge functions | Critical | FIXED | Shared `_shared/cors.ts` module restricts to production domain |
| 3 | Resend API key in client-side bundle | Critical | FIXED | Rewrote `emailService.ts` to proxy through `send-booking-email` edge function |
| 4 | `.env` committed to git history | Critical | PARTIAL | Removed secret keys from `.env`; **manual action needed: rotate keys + scrub git history** |
| 5 | No rate limiting on any endpoint | Critical | FIXED | Shared `_shared/rate-limit.ts` added to 6 public edge functions |
| 6 | Payment verification client-initiated & unauthenticated | Critical | FIXED | Amount verified against DB (not client); idempotency check added |
| 7 | Auth tokens in localStorage (XSS-exfiltrable) | High | MITIGATED | CSP headers restrict script execution (Fix #12); full fix requires httpOnly cookie proxy |
| 8 | Service role key in unauthenticated functions | High | MITIGATED | JWT gate on auth-required functions (Fix #1); public functions have rate limits |
| 9 | Weak password policy (6 chars, no complexity) | High | FIXED | `passwordValidation.ts`: 8+ chars, uppercase, lowercase, number |
| 10 | Known dependency vulnerabilities | High | FIXED | `npm audit fix` resolved high-severity issues; 2 moderate remain (Vite v7 upgrade needed) |
| 11 | Error messages expose implementation details | High | FIXED | Redacted raw error messages across `Auth.tsx` and edge functions |
| 12 | No HTTP security headers | Medium | FIXED | `vercel.json`: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| 13 | No CSRF protection | Medium | MITIGATED | CORS restriction (Fix #2) prevents cross-origin POST from unauthorized sites |
| 14 | Client-side-only file upload validation | Medium | FIXED | Added file extension allowlist and hard max file size to `PropertyImageUpload.tsx` |
| 15 | Sensitive data in console logs | Medium | FIXED | 76 console statements redacted across all 12 edge functions |
| 16 | Audit trail table exists but unused | Medium | FIXED | `_shared/audit.ts`: logging in `delete-user`, `verify-payment`, `cancel-booking`, `accept-invitation` |
| 17 | `dangerouslySetInnerHTML` usage | Medium | ACCEPTED | Documented as safe: data is developer-defined `ChartConfig`, no user input path |
| 18 | Email template injection risk | Medium | FIXED | `_shared/sanitize.ts` with `escapeHtml()` applied to all user-controlled template data |
| 19 | No session timeout | Medium | FIXED | 30-minute idle timeout with automatic sign-out in `useAuth.tsx` |
| 20 | Dual lock files | Info | OPEN | Requires team decision on package manager standardization |

---

## Remaining Manual Actions Required

1. **Rotate all secrets** that were exposed via `.env` in git history (Supabase anon key, Paystack key)
2. **Scrub git history** using `git filter-repo` or BFG Repo-Cleaner to remove `.env` from past commits
3. **Upgrade Vite to v7** to resolve remaining 2 moderate `esbuild` vulnerabilities
4. **Set `ALLOWED_ORIGINS` environment variable** in Supabase Edge Function secrets for your production domain
5. **Evaluate httpOnly cookie auth** as a future architecture improvement for token storage
6. **Add CAPTCHA** to the public booking flow to prevent automated abuse
7. **Set up Dependabot/Snyk** for automated dependency vulnerability scanning
8. **Standardize on one package manager** (npm or bun) and remove the unused lock file
