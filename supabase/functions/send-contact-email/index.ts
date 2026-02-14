
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface ContactEmailRequest {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

serve(async (req) => {
    // Handle CORS preflight
    const corsResponse = handleCorsPreflightRequest(req);
    if (corsResponse) return corsResponse;

    try {
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed' }),
                { status: 405, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
            );
        }

        const { name, email, phone, message }: ContactEmailRequest = await req.json();

        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
            );
        }

        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Email service not configured' }),
                { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
            );
        }

        const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Brooklyn Hills Contact <contact@notifications.brooklynhillsapartment.com>',
                to: ['bookings@brooklynhillsapartment.com'], // Send to the business email
                reply_to: email, // Allow replying directly to the user
                subject: `New Inquiry from ${name}`,
                html: emailHtml,
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error('Resend email failed:', resendData);
            return new Response(
                JSON.stringify({ error: 'Failed to send email', details: resendData }),
                { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, id: resendData.id }),
            { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
    }
});
