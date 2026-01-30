import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    const MAILCHIMP_LIST_ID = Deno.env.get("MAILCHIMP_LIST_ID");
    const MAILCHIMP_SERVER_PREFIX = Deno.env.get("MAILCHIMP_SERVER_PREFIX");

    if (!MAILCHIMP_API_KEY) {
      throw new Error("MAILCHIMP_API_KEY is not configured");
    }
    if (!MAILCHIMP_LIST_ID) {
      throw new Error("MAILCHIMP_LIST_ID is not configured");
    }
    if (!MAILCHIMP_SERVER_PREFIX) {
      throw new Error("MAILCHIMP_SERVER_PREFIX is not configured");
    }

    const { email, firstName, lastName }: SubscribeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Subscribing email: ${email} (${firstName} ${lastName}) to Mailchimp list: ${MAILCHIMP_LIST_ID}`);

    const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

    const requestBody: Record<string, unknown> = {
      email_address: email,
      status: "subscribed",
    };

    // Add merge fields if first/last name provided
    if (firstName || lastName) {
      requestBody.merge_fields = {
        FNAME: firstName || "",
        LNAME: lastName || "",
      };
    }

    const response = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mailchimp API error:", data);
      
      // Handle already subscribed case
      if (data.title === "Member Exists") {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "This email is already subscribed to our newsletter!" 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`Mailchimp API error [${response.status}]: ${data.detail || data.title}`);
    }

    console.log(`Successfully subscribed ${email} to newsletter`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully subscribed to the newsletter!" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Newsletter subscription error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
