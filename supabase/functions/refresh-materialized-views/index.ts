import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";

/**
 * Edge Function to refresh materialized views
 * 
 * This function can be called:
 * 1. Manually via HTTP request
 * 2. Scheduled via Supabase Cron (if available)
 * 3. From the application after significant changes
 * 
 * Usage:
 * - POST /functions/v1/refresh-materialized-views
 *   Body: { "views": ["mv_revenue_summary"] } or {} to refresh all
 * 
 * - GET /functions/v1/refresh-materialized-views
 *   Returns status of views (last refresh time, row count, etc.)
 */

interface RefreshRequest {
  views?: string[]; // Specific views to refresh, or all if empty
}

interface ViewStatus {
  name: string;
  lastRefresh: string | null;
  rowCount: number;
  size: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // GET request - return status of materialized views
    if (req.method === "GET") {
      const { data: views, error } = await supabase.rpc("get_materialized_view_status");

      if (error) {
        console.error("Error fetching view status:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch view status", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          views: views || [],
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST request - refresh specified views or all
    if (req.method === "POST") {
      let body: RefreshRequest = {};
      try {
        body = await req.json();
      } catch {
        // Empty body is fine - will refresh all views
      }

      const viewsToRefresh = body.views || ["mv_revenue_summary"];
      const results: { view: string; success: boolean; error?: string }[] = [];

      for (const viewName of viewsToRefresh) {
        try {
          // Validate view name to prevent SQL injection
          const validViews = ["mv_revenue_summary"];
          if (!validViews.includes(viewName)) {
            results.push({ view: viewName, success: false, error: "Invalid view name" });
            continue;
          }

          // Refresh the materialized view
          const { error } = await supabase.rpc("refresh_materialized_view", {
            view_name: viewName
          });

          if (error) {
            console.error(`Error refreshing ${viewName}:`, error);
            results.push({ view: viewName, success: false, error: error.message });
          } else {
            console.log(`Successfully refreshed ${viewName}`);
            results.push({ view: viewName, success: true });
          }
        } catch (err: any) {
          console.error(`Exception refreshing ${viewName}:`, err);
          results.push({ view: viewName, success: false, error: err.message });
        }
      }

      const allSuccess = results.every(r => r.success);

      return new Response(
        JSON.stringify({
          success: allSuccess,
          results,
          timestamp: new Date().toISOString()
        }),
        { 
          status: allSuccess ? 200 : 207, // 207 Multi-Status if some failed
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use GET for status, POST for refresh." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in refresh-materialized-views function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
