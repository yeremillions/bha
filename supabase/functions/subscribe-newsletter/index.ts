import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Rate limit: 3 subscribe attempts per minute per IP
  const rateLimited = checkRateLimit(req, getCorsHeaders(req), { maxRequests: 3, windowSeconds: 60 });
  if (rateLimited) return rateLimited;

  try {
    const SENDFOX_API_TOKEN = Deno.env.get("SENDFOX_API_TOKEN");
    const SENDFOX_LIST_ID = Deno.env.get("SENDFOX_LIST_ID");

    if (!SENDFOX_API_TOKEN) {
      throw new Error("SENDFOX_API_TOKEN is not configured");
    }
    if (!SENDFOX_LIST_ID) {
      throw new Error("SENDFOX_LIST_ID is not configured");
    }

    const { email, firstName, lastName }: SubscribeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    console.log('Processing newsletter subscription');

    const sendfoxUrl = "https://api.sendfox.com/contacts";

    const requestBody: Record<string, unknown> = {
      email: email,
      first_name: firstName || "",
      last_name: lastName || "",
      lists: [parseInt(SENDFOX_LIST_ID, 10)],
    };

    const response = await fetch(sendfoxUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDFOX_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SendFox API error, status:", response.status);
      
      // Handle already subscribed case (SendFox returns 200 for existing contacts, but check for duplicates)
      if (response.status === 400 && data.message?.includes("already")) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "You're already subscribed to our newsletter!" 
          }),
          {
            status: 200,
            headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
          }
        );
      }

      // Handle contact limit exceeded
      if (response.status === 402) {
        throw new Error("Newsletter subscription limit reached. Please try again later.");
      }

      throw new Error(`SendFox API error [${response.status}]`);
    }

    console.log('Newsletter subscription processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully subscribed to the newsletter!" 
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Newsletter subscription error");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});
