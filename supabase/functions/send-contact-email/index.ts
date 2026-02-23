
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Shared CORS logic
const ALLOWED_ORIGINS = [
    "https://brooklynhillsapartment.com",
    "https://www.brooklynhillsapartment.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
];

function getCorsHeaders(req: Request) {
    const origin = req.headers.get('Origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        };
    }
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
}

interface ContactEmailRequest {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

// Using Deno.serve for consistency with newer functions
Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) });
    }

    try {
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
      <h2>New Inquiry from ${name}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

        console.log(`Sending contact email from ${name} (${email}) to bookings@brooklynhillsapartment.com`);

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                // Using the verified notifications subdomain for reliable delivery
                from: 'Brooklyn Hills Contact <contact@notifications.brooklynhillsapartment.com>',
                to: ['bookings@brooklynhillsapartment.com'],
                reply_to: email,
                subject: `New Inquiry from ${name}`,
                html: emailHtml,
            }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
            console.error('Resend email failed:', JSON.stringify(resendData));
            return new Response(
                JSON.stringify({ error: 'Failed to send email', details: resendData }),
                { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
            );
        }

        console.log('Contact email sent successfully:', resendData.id);

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
