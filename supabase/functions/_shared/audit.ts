import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Write an audit log entry. Uses the service-role client to bypass RLS.
 * Call this from edge functions for critical operations like:
 * - User deletion
 * - Payment processing
 * - Booking cancellation
 * - Account creation via invitation
 */
export async function writeAuditLog(
  supabaseAdmin: SupabaseClient,
  entry: {
    action: string;
    userId?: string;
    userEmail?: string;
    details?: string;
  }
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      action: entry.action,
      user_id: entry.userId || null,
      user_email: entry.userEmail || null,
      details: entry.details || null,
    });
  } catch (err) {
    // Never let audit logging failures break the main operation
    console.error("Failed to write audit log");
  }
}
