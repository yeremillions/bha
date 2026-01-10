-- ============================================================================
-- Fix: Resolve ambiguous column reference in generate_task_number function
-- ============================================================================
-- The issue: local variable 'task_number' conflicts with column name 'task_number'
-- Solution: Rename local variable and explicitly qualify column references
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_task_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  new_number TEXT;  -- Renamed from 'task_number' to avoid ambiguity
BEGIN
  -- Get the next sequence number (explicitly qualify the column)
  SELECT COALESCE(MAX(CAST(SUBSTRING(housekeeping_tasks.task_number FROM 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM housekeeping_tasks
  WHERE housekeeping_tasks.task_number ~ '^CL[0-9]+$';

  -- Format as CL001, CL002, etc.
  new_number := 'CL' || LPAD(next_number::TEXT, 3, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
