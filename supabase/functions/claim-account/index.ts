import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

interface ClaimAccountRequest {
  bookingNumber: string;
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Rate limit: 5 account claim attempts per minute per IP
  const rateLimited = checkRateLimit(req, getCorsHeaders(req), { maxRequests: 5, windowSeconds: 60 });
  if (rateLimited) return rateLimited;

  try {
    const { bookingNumber, email, password }: ClaimAccountRequest = await req.json();

    console.log("Processing account claim request");

    if (!bookingNumber || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: bookingNumber, email, password" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters and contain uppercase, lowercase, and a number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Create Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify booking exists and belongs to this email
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        booking_number,
        customer:customers!bookings_customer_id_fkey (
          id,
          full_name,
          email,
          phone,
          user_id
        )
      `)
      .eq("booking_number", bookingNumber.toUpperCase())
      .maybeSingle();

    if (bookingError) {
      console.error("Booking fetch error during account claim");
      return new Response(
        JSON.stringify({ error: "Failed to verify booking" }),
        { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    const customer = booking.customer as {
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      user_id: string | null;
    };

    // Verify email matches
    if (customer.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Email does not match booking" }),
        { status: 403, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Check if customer already has a user account
    if (customer.user_id) {
      return new Response(
        JSON.stringify({ error: "An account already exists for this email. Please sign in instead." }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Check if a user with this email already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      // Link existing user to customer
      const { error: linkError } = await supabaseAdmin
        .from("customers")
        .update({ user_id: existingUser.id })
        .eq("id", customer.id);

      if (linkError) {
        console.error("Error linking existing user to customer");
      }

      return new Response(
        JSON.stringify({ error: "An account with this email already exists. Please sign in instead." }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    console.log("Creating user account for claimed booking");

    // Create user with Admin API - email is auto-confirmed
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: customer.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: customer.full_name,
        phone: customer.phone,
      },
    });

    if (createUserError) {
      console.error("User creation error during account claim");
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    console.log("User created successfully for account claim");

    // Link the user to the customer record
    const { error: updateError } = await supabaseAdmin
      .from("customers")
      .update({ user_id: userData.user.id })
      .eq("id", customer.id);

    if (updateError) {
      console.error("Error linking user to customer record");
      // Don't fail - user was created successfully
    }

    console.log("Account claimed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );

  } catch (error: any) {
    console.error("Error in claim-account function");
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);
