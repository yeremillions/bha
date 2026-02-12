-- Migration: Set up Materialized View Refresh Schedule
-- This creates automated refresh for the revenue summary materialized view
-- Date: 2026-02-11

-- =====================================================
-- OPTION 1: Using pg_cron extension (Recommended if available)
-- =====================================================
-- Note: pg_cron may not be available on all Supabase tiers
-- Check if pg_cron is available first

-- Uncomment and run this section if pg_cron is available:
/*
-- Enable pg_cron extension (requires superuser or specific permissions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the refresh to run every hour
-- This will refresh the materialized view hourly at minute 0
SELECT cron.schedule(
  'refresh-revenue-summary-hourly',  -- Job name
  '0 * * * *',                      -- Cron expression (every hour at minute 0)
  'SELECT refresh_revenue_summary()'  -- SQL command to execute
);

-- Alternative: Refresh every 30 minutes
-- SELECT cron.schedule('refresh-revenue-summary-30min', '*/30 * * * *', 'SELECT refresh_revenue_summary()');

-- Alternative: Refresh every night at 2 AM
-- SELECT cron.schedule('refresh-revenue-summary-nightly', '0 2 * * *', 'SELECT refresh_revenue_summary()');

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- Unschedule if needed
-- SELECT cron.unschedule('refresh-revenue-summary-hourly');
*/

-- =====================================================
-- OPTION 2: Trigger-based refresh (Alternative approach)
-- =====================================================
-- This refreshes the materialized view whenever a transaction is inserted/updated
-- Use with caution - may cause performance issues with high transaction volume

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_revenue_summary_trigger()
RETURNS trigger AS $$
BEGIN
  -- Refresh the materialized view
  -- Using CONCURRENTLY to avoid locking during refresh
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_summary;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh after transaction changes
-- Uncomment if you want real-time refresh (may impact performance)
/*
DROP TRIGGER IF EXISTS refresh_revenue_summary_on_transaction ON transactions;
CREATE TRIGGER refresh_revenue_summary_on_transaction
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_revenue_summary_trigger();
*/

-- =====================================================
-- OPTION 3: Manual refresh function with debouncing
-- =====================================================
-- This approach uses a table to track refresh requests and processes them in batches

-- Create a refresh queue table
CREATE TABLE IF NOT EXISTS mv_refresh_queue (
  id SERIAL PRIMARY KEY,
  view_name TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed BOOLEAN DEFAULT FALSE
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_mv_refresh_queue_processed ON mv_refresh_queue(processed, requested_at);

-- Function to queue a refresh request
CREATE OR REPLACE FUNCTION queue_mv_refresh(p_view_name TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO mv_refresh_queue (view_name)
  VALUES (p_view_name);
END;
$$ LANGUAGE plpgsql;

-- Function to process pending refresh requests (call this periodically)
CREATE OR REPLACE FUNCTION process_mv_refresh_queue()
RETURNS void AS $$
DECLARE
  v_view_name TEXT;
  v_last_refresh TIMESTAMPTZ;
BEGIN
  -- Get distinct views that need refreshing (only process if not refreshed in last 5 minutes)
  FOR v_view_name IN
    SELECT DISTINCT view_name
    FROM mv_refresh_queue
    WHERE processed = FALSE
    GROUP BY view_name
    HAVING MAX(requested_at) > COALESCE(
      (SELECT MAX(processed_at) FROM mv_refresh_queue WHERE view_name = mv_refresh_queue.view_name AND processed = TRUE),
      '1970-01-01'::TIMESTAMPTZ
    ) + INTERVAL '5 minutes'
  LOOP
    -- Refresh the view
    IF v_view_name = 'mv_revenue_summary' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_summary;
    END IF;
    
    -- Mark requests as processed
    UPDATE mv_refresh_queue
    SET processed = TRUE, processed_at = NOW()
    WHERE view_name = v_view_name AND processed = FALSE;
  END LOOP;
  
  -- Clean up old processed records (keep last 7 days)
  DELETE FROM mv_refresh_queue
  WHERE processed = TRUE AND processed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger function to queue refresh on transaction changes (debounced)
CREATE OR REPLACE FUNCTION queue_revenue_summary_refresh()
RETURNS trigger AS $$
BEGIN
  -- Queue a refresh request
  PERFORM queue_mv_refresh('mv_revenue_summary');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to queue refresh after transaction changes
-- This is a lighter alternative to immediate refresh
DROP TRIGGER IF EXISTS queue_revenue_summary_refresh_on_transaction ON transactions;
CREATE TRIGGER queue_revenue_summary_refresh_on_transaction
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH STATEMENT
  EXECUTE FUNCTION queue_revenue_summary_refresh();

-- =====================================================
-- OPTION 4: Application-level refresh (Recommended for most cases)
-- =====================================================
-- The application can call refresh_revenue_summary() after significant operations

-- Create a function to check if refresh is needed
CREATE OR REPLACE FUNCTION should_refresh_revenue_summary()
RETURNS boolean AS $$
DECLARE
  v_last_refresh TIMESTAMPTZ;
  v_pending_transactions INTEGER;
BEGIN
  -- Check if there are unprocessed transactions since last refresh
  -- This is a simplified check - you may want to customize based on your needs
  
  -- Get approximate last refresh time (from pg_stat_user_tables if available)
  SELECT COALESCE(
    (SELECT MAX(processed_at) FROM mv_refresh_queue WHERE view_name = 'mv_revenue_summary' AND processed = TRUE),
    NOW() - INTERVAL '1 hour'
  ) INTO v_last_refresh;
  
  -- Count transactions since last refresh
  SELECT COUNT(*) INTO v_pending_transactions
  FROM transactions
  WHERE created_at > v_last_refresh
    AND status = 'completed';
  
  -- Refresh if more than 10 new transactions
  RETURN v_pending_transactions > 10;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION refresh_revenue_summary() IS 'Refreshes the mv_revenue_summary materialized view. Call this periodically or after significant transaction changes.';
COMMENT ON FUNCTION queue_mv_refresh(TEXT) IS 'Queues a materialized view refresh request for batch processing.';
COMMENT ON FUNCTION process_mv_refresh_queue() IS 'Processes pending materialized view refresh requests. Call this periodically (e.g., every 5 minutes).';
COMMENT ON FUNCTION should_refresh_revenue_summary() IS 'Checks if the revenue summary materialized view should be refreshed based on pending transactions.';
COMMENT ON TABLE mv_refresh_queue IS 'Queue table for materialized view refresh requests. Used for debounced refresh operations.';

-- =====================================================
-- DATABASE FUNCTIONS FOR EDGE FUNCTION INTEGRATION
-- =====================================================

-- Function to refresh a materialized view by name (used by edge function)
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name TEXT)
RETURNS void AS $$
BEGIN
  IF view_name = 'mv_revenue_summary' THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_summary;
  ELSE
    RAISE EXCEPTION 'Unknown materialized view: %', view_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get materialized view status (used by edge function)
CREATE OR REPLACE FUNCTION get_materialized_view_status()
RETURNS TABLE (
  name TEXT,
  last_refresh TIMESTAMPTZ,
  row_count BIGINT,
  size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::TEXT as name,
    NULL::TIMESTAMPTZ as last_refresh,  -- PostgreSQL doesn't track this directly
    (SELECT COUNT(*) FROM mv_revenue_summary) as row_count,
    pg_size_pretty(pg_total_relation_size(c.oid)) as size
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'm'  -- materialized views
    AND n.nspname = 'public'
    AND c.relname = 'mv_revenue_summary';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users (for edge function)
GRANT EXECUTE ON FUNCTION refresh_materialized_view(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_materialized_view_status() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_revenue_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION should_refresh_revenue_summary() TO authenticated;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
/*

OPTION 1 - pg_cron (Best for production):
-----------------------------------------
1. Check if pg_cron is available in your Supabase project
2. If yes, uncomment and run the pg_cron section above
3. The view will refresh automatically every hour

OPTION 2 - Trigger-based (Real-time but may impact performance):
---------------------------------------------------------------
1. Uncomment the trigger creation in OPTION 2
2. The view will refresh immediately after every transaction change
3. Monitor performance - may cause delays with high transaction volume

OPTION 3 - Debounced refresh (Good balance):
-------------------------------------------
1. The trigger in OPTION 3 is already created
2. Call process_mv_refresh_queue() periodically via:
   - Supabase Edge Function scheduled invocation
   - External cron job calling the function
   - Application logic calling it every few minutes

OPTION 4 - Application-level (Most control):
-------------------------------------------
1. Call refresh_revenue_summary() from your application:
   - After batch transaction imports
   - After significant booking changes
   - Periodically via a scheduled job
   - When admin views the reports page

RECOMMENDED APPROACH:
--------------------
For most use cases, use OPTION 4 with application-level refresh:
- Call refresh_revenue_summary() when admin opens the Reports page
- Call it after batch operations (bulk imports, etc.)
- Use should_refresh_revenue_summary() to decide if refresh is needed

*/
