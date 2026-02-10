import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';

interface InvitationEmailRequest {
  invitationId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('send-team-invitation: Starting request processing');

    // Verify request method
    if (req.method !== 'POST') {
      console.log('send-team-invitation: Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('send-team-invitation: Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the user is authenticated and has permission
    const token = authHeader.replace('Bearer ', '');
    console.log('send-team-invitation: Verifying user token');
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.log('send-team-invitation: Auth error');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    console.log('send-team-invitation: User authenticated');

    // Check if user has permission (admin or manager)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    console.log('send-team-invitation: Profile lookup completed');

    if (profileError) {
      console.error('send-team-invitation: Profile lookup error');
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      console.log('send-team-invitation: Insufficient permissions, role:', profile?.role);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { invitationId }: InvitationEmailRequest = await req.json();
    console.log('send-team-invitation: Processing invitation:', invitationId);

    if (!invitationId) {
      return new Response(
        JSON.stringify({ error: 'Missing invitationId' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('send-team-invitation: Invitation not found');
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    console.log('send-team-invitation: Found invitation:', invitationId);

    // Get inviter details
    let inviterName = 'Your team';
    if (invitation.invited_by) {
      const { data: inviterProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', invitation.invited_by)
        .maybeSingle();
      
      inviterName = inviterProfile?.full_name || inviterProfile?.email || 'Your team';
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('send-team-invitation: RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Build acceptance URL
    const acceptanceUrl = `${APP_URL}/accept-invitation/${invitation.invite_token}`;
    console.log('send-team-invitation: Acceptance URL generated');

    // Format role and department for display
    const roleDisplay = invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1);
    const departmentDisplay = invitation.department.charAt(0).toUpperCase() + invitation.department.slice(1);

    // Prepare email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join Brooklyn Hills</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Welcome to Brooklyn Hills
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi there! 👋
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                <strong>${inviterName}</strong> has invited you to join the Brooklyn Hills team as a <strong>${roleDisplay}</strong> in the <strong>${departmentDisplay}</strong> department.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Click the button below to accept your invitation and create your account:
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${acceptanceUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Details Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #666666;">
                      INVITATION DETAILS
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #666666;">Role:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">${roleDisplay}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #666666;">Department:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">${departmentDisplay}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #666666;">Invited by:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">${inviterName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #666666;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Or copy and paste this link into your browser:<br>
                <a href="${acceptanceUrl}" style="color: #667eea; word-break: break-all;">${acceptanceUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Brooklyn Hills - Hospitality Management System<br>
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Plain text version
    const emailText = `
Welcome to Brooklyn Hills!

${inviterName} has invited you to join the Brooklyn Hills team as a ${roleDisplay} in the ${departmentDisplay} department.

Click the link below to accept your invitation and create your account:
${acceptanceUrl}

INVITATION DETAILS
- Role: ${roleDisplay}
- Department: ${departmentDisplay}
- Invited by: ${inviterName}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
Brooklyn Hills - Hospitality Management System
This is an automated message, please do not reply to this email.
    `.trim();

    console.log('send-team-invitation: Sending invitation email');

    // Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Brooklyn Hills <noreply@notifications.brooklynhillsapartment.com>',
        to: [invitation.email],
        subject: `You're invited to join Brooklyn Hills as ${roleDisplay}`,
        html: emailHtml,
        text: emailText,
      }),
    });

    const resendData = await resendResponse.json();
    console.log('send-team-invitation: Resend response status:', resendResponse.status);

    if (!resendResponse.ok) {
      console.error('send-team-invitation: Resend email sending failed');
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: resendData
        }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('send-team-invitation: Email sent successfully, ID:', resendData.id);

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: 'Invitation email sent successfully'
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    console.error('send-team-invitation: Unexpected error');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: errorMessage
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
      }
    );
  }
});
