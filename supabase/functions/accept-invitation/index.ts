import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { writeAuditLog } from "../_shared/audit.ts";

interface AcceptInvitationRequest {
  token: string;
  password: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  try {
    const { token, password, fullName }: AcceptInvitationRequest = await req.json();

    console.log("Accept invitation request received");

    if (!token || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: token, password, fullName" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Create Supabase admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("team_invitations")
      .select("*")
      .eq("invite_token", token)
      .maybeSingle();

    if (invitationError || !invitation) {
      console.error("Invitation fetch error");
      return new Response(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    // Validate invitation status
    if (invitation.status === "accepted") {
      return new Response(
        JSON.stringify({ error: "Invitation has already been accepted" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (invitation.status === "revoked") {
      return new Response(
        JSON.stringify({ error: "Invitation has been revoked" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Invitation has expired" }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    console.log("Creating user for invitation, role:", invitation.role, "department:", invitation.department);

    // Create user with Admin API - email is auto-confirmed!
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true, // Auto-confirm since they clicked the invitation link
      user_metadata: {
        full_name: fullName,
        role: invitation.role,
        department: invitation.department,
      },
    });

    if (createUserError) {
      console.error("User creation error");
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
      );
    }

    console.log("User created successfully");

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from("team_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        user_id: userData.user.id,
      })
      .eq("invite_token", token);

    if (updateError) {
      console.error("Error updating invitation status");
      // Don't fail - user was created successfully
    }

    console.log("Invitation accepted successfully");

    await writeAuditLog(supabaseAdmin, {
      action: 'invitation.accepted',
      userId: userData.user.id,
      details: `Invitation accepted, role: ${invitation.role}, department: ${invitation.department}`,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: userData.user.id, 
          email: userData.user.email 
        } 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );

  } catch (error: any) {
    console.error("Error in accept-invitation function");
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

serve(handler);
