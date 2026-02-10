import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

interface ValidateInvitationRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const { token }: ValidateInvitationRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing required field: token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Create Supabase admin client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch the invitation using service role (bypasses RLS)
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("team_invitations")
      .select("id, email, role, department, status, expires_at, created_at")
      .eq("invite_token", token)
      .maybeSingle();

    if (invitationError) {
      console.error("Invitation fetch error");
      return new Response(
        JSON.stringify({ error: "Failed to validate invitation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (!invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found", valid: false }),
        { status: 404, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Return invitation details (excluding sensitive token)
    return new Response(
      JSON.stringify({ 
        valid: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          department: invitation.department,
          status: invitation.status,
          expires_at: invitation.expires_at,
          created_at: invitation.created_at,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );

  } catch (error: any) {
    console.error("Error in validate-invitation function");
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);
