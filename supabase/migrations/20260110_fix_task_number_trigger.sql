-- ============================================================================
-- FIX: Add missing trigger for auto-generating task numbers
-- ============================================================================

-- Create trigger function to set task_number before insert
CREATE OR REPLACE FUNCTION set_task_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if task_number is not provided
  IF NEW.task_number IS NULL OR NEW.task_number = '' THEN
    NEW.task_number := generate_task_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate task numbers
DROP TRIGGER IF EXISTS trigger_set_task_number ON housekeeping_tasks;
CREATE TRIGGER trigger_set_task_number
  BEFORE INSERT ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_number();
