-- Migration: Create database views for efficient reporting
-- This addresses the scalability concern of client-side calculations
-- Date: 2026-02-11

-- =====================================================
-- 1. REVENUE SUMMARY MATERIALIZED VIEW
-- =====================================================
-- Materialized view for daily revenue aggregation
-- Refresh periodically (e.g., every hour) or after significant transactions

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  transaction_type,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', created_at), transaction_type, category;

-- Create indexes for faster queries on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_revenue_summary_date ON mv_revenue_summary(date);
CREATE INDEX IF NOT EXISTS idx_mv_revenue_summary_category ON mv_revenue_summary(category);
CREATE INDEX IF NOT EXISTS idx_mv_revenue_summary_type ON mv_revenue_summary(transaction_type);

-- Note: Using created_at instead of transaction_date as the transactions table
-- uses created_at for the timestamp field

-- Function to refresh materialized view (call this periodically)
CREATE OR REPLACE FUNCTION refresh_revenue_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. OCCUPANCY STATISTICS VIEW
-- =====================================================
-- Real-time view for occupancy metrics

CREATE OR REPLACE VIEW vw_occupancy_stats AS
SELECT
  p.id as property_id,
  p.name as property_name,
  p.status as property_status,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status IN ('confirmed', 'checked_in') THEN 1 END) as active_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
  COALESCE(SUM(b.total_amount), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'checked_in') THEN b.total_amount ELSE 0 END), 0) as active_revenue
FROM properties p
LEFT JOIN bookings b ON p.id = b.property_id
GROUP BY p.id, p.name, p.status;

-- =====================================================
-- 3. BOOKING STATISTICS VIEW
-- =====================================================
-- Aggregated booking metrics by date

CREATE OR REPLACE VIEW vw_booking_stats AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
  COUNT(CASE WHEN status = 'checked_in' THEN 1 END) as checked_in_bookings,
  COALESCE(SUM(total_amount), 0) as total_revenue,
  COALESCE(AVG(total_amount), 0) as average_booking_value
FROM bookings
GROUP BY DATE_TRUNC('day', created_at);

-- =====================================================
-- 4. BAR SALES STATISTICS VIEW
-- =====================================================
-- Aggregated bar sales metrics

CREATE OR REPLACE VIEW vw_bar_sales_stats AS
SELECT
  DATE_TRUNC('day', closed_at) as date,
  COUNT(*) as total_tabs,
  COALESCE(SUM(subtotal), 0) as total_subtotal,
  COALESCE(SUM(tax_amount), 0) as total_tax,
  COALESCE(SUM(total), 0) as total_revenue,
  COALESCE(AVG(total), 0) as average_tab_value
FROM bar_tabs
WHERE status = 'closed'
GROUP BY DATE_TRUNC('day', closed_at);

-- =====================================================
-- 5. CUSTOMER STATISTICS VIEW
-- =====================================================
-- Customer booking and spending metrics

CREATE OR REPLACE VIEW vw_customer_stats AS
SELECT
  c.id as customer_id,
  c.full_name,
  c.email,
  COUNT(b.id) as total_bookings,
  COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_amount ELSE 0 END), 0) as total_spent,
  COALESCE(AVG(CASE WHEN b.status != 'cancelled' THEN b.total_amount ELSE NULL END), 0) as average_booking_value,
  MAX(b.created_at) as last_booking_date
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
GROUP BY c.id, c.full_name, c.email;

-- =====================================================
-- 6. FINANCIAL SUMMARY VIEW
-- =====================================================
-- Monthly financial overview

CREATE OR REPLACE VIEW vw_financial_summary AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  transaction_type,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at), transaction_type, category;

-- Create indexes on the underlying tables for better view performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bar_tabs_closed_at ON bar_tabs(closed_at);

-- Add comments for documentation
COMMENT ON MATERIALIZED VIEW mv_revenue_summary IS 'Daily revenue aggregation - refresh periodically for up-to-date data';
COMMENT ON VIEW vw_occupancy_stats IS 'Real-time occupancy statistics per property';
COMMENT ON VIEW vw_booking_stats IS 'Daily booking statistics and revenue';
COMMENT ON VIEW vw_bar_sales_stats IS 'Daily bar sales statistics';
COMMENT ON VIEW vw_customer_stats IS 'Customer lifetime value and booking metrics';
COMMENT ON VIEW vw_financial_summary IS 'Monthly financial summary by category';
