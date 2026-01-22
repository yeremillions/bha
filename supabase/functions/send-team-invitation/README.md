# Send Team Invitation Edge Function

This Supabase Edge Function handles sending team invitation emails via Resend.

## Prerequisites

1. **Resend Account**: Sign up at [resend.com](https://resend.com)
2. **Supabase CLI**: Install from [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)

## Setup Instructions

### 1. Get Resend API Key

1. Log in to your Resend account
2. Navigate to **API Keys** section
3. Create a new API key
4. Copy the API key (starts with `re_`)

### 2. Configure Email Domain (Important!)

For production use, you need to verify your domain in Resend:

1. Go to Resend Dashboard → **Domains**
2. Add your domain (e.g., `brooklynhills.ng`)
3. Add the provided DNS records to your domain
4. Wait for verification

**For Development/Testing:**
- Resend provides a test domain that can send to your verified email addresses
- You can send test emails to any address you've added in Resend's "Test Recipients"

### 3. Deploy the Edge Function

```bash
# Navigate to project root
cd /home/user/bha

# Login to Supabase CLI (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref nnrzsvtaeulxunxnbxtw

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Set the APP_URL (your frontend URL)
supabase secrets set APP_URL=http://localhost:5173  # For development
# OR for production:
# supabase secrets set APP_URL=https://yourdomain.com

# Deploy the function
supabase functions deploy send-team-invitation
```

### 4. Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs send-team-invitation
```

## Environment Variables

The edge function requires these environment variables:

| Variable | Description | Set By |
|----------|-------------|--------|
| `RESEND_API_KEY` | Your Resend API key | Manual (via secrets) |
| `APP_URL` | Your frontend URL | Manual (via secrets) |
| `SUPABASE_URL` | Supabase project URL | Automatic |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Automatic |

## Testing the Function

### Test via cURL

```bash
# Get your access token from browser console or Supabase dashboard
ACCESS_TOKEN="your_access_token_here"

curl -X POST \
  'https://nnrzsvtaeulxunxnbxtw.supabase.co/functions/v1/send-team-invitation' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invitationId": "uuid-of-invitation"
  }'
```

### Test via Application

1. Log in as an admin or manager
2. Go to **Settings → User Management**
3. Click **Invite Team Member**
4. Fill in the form and submit
5. Check the recipient's email inbox

## Email Template

The function sends a professionally designed HTML email with:
- Brooklyn Hills branding
- Invitation details (role, department, inviter)
- Call-to-action button
- Acceptance link
- 7-day expiration notice

## Security Features

- **Authentication Check**: Verifies user is logged in
- **Permission Check**: Only admins and managers can send invitations
- **Token Validation**: Uses secure invite tokens
- **RLS Policies**: Database-level security enforcement

## Troubleshooting

### Issue: "Email service not configured"

**Solution**: Set the RESEND_API_KEY secret
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Issue: "Failed to send email"

**Possible causes:**
1. **Invalid API Key**: Check your Resend API key is correct
2. **Unverified Domain**: For production, verify your domain in Resend
3. **Rate Limiting**: Check Resend dashboard for rate limits
4. **Invalid Email**: Ensure email format is correct

**Check logs:**
```bash
supabase functions logs send-team-invitation --tail
```

### Issue: Email not received

1. **Check spam/junk folder**
2. **Verify email address is correct**
3. **Check Resend dashboard** for delivery status
4. **For development**: Add recipient to Resend's test recipients

### Issue: "Unauthorized" error

**Solution**: User must be logged in and have admin/manager role
- Check user_profiles table for correct role
- Verify RLS policies are applied

## Production Checklist

- [ ] Resend API key configured
- [ ] Domain verified in Resend
- [ ] APP_URL set to production domain
- [ ] Edge function deployed
- [ ] Test invitation sent successfully
- [ ] Email received and links work
- [ ] Invitation acceptance flow tested

## Resend Configuration

### Recommended Settings

1. **From Email**: `noreply@brooklynhills.ng`
2. **Reply-To**: Your support email
3. **Email Categories**: Create "team-invitations" category for tracking
4. **Webhooks**: Optional - Set up webhooks for delivery tracking

### Rate Limits

Free tier:
- 100 emails/day
- 3,000 emails/month

Paid tier:
- Higher limits based on plan

## Email Template Customization

To customize the email template, edit the `emailHtml` variable in `/home/user/bha/supabase/functions/send-team-invitation/index.ts`:

- Update colors to match your brand
- Modify text and copy
- Change logo/branding elements
- Adjust layout and styling

## Support

For issues with:
- **Resend**: [resend.com/docs](https://resend.com/docs)
- **Supabase Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **This implementation**: Check function logs or contact your development team
