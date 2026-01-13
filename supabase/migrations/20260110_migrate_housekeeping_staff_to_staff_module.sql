-- ============================================================================
-- Migrate housekeeping_staff to staff module
-- ============================================================================
-- This migration:
-- 1. Migrates existing housekeeping_staff data to the staff table
-- 2. Updates housekeeping_tasks to reference staff table instead
-- 3. Updates auto_assign function to use staff table
-- 4. Preserves all existing data and relationships
-- ============================================================================

-- Step 1: Migrate existing housekeeping_staff to staff table
-- Use a temporary function to generate unique employee IDs that don't conflict
DO $$
DECLARE
  max_emp_num INTEGER;
  hs_record RECORD;
  new_emp_id TEXT;
BEGIN
  -- Get the maximum existing employee number
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(employee_id FROM 4) AS INTEGER
      )
    ), 0
  ) INTO max_emp_num
  FROM staff
  WHERE employee_id ~ '^EMP[0-9]+$';

  -- Insert each housekeeping staff member with sequential employee_id
  FOR hs_record IN
    SELECT
      hs.id,
      hs.full_name,
      hs.email,
      hs.phone,
      hs.status,
      hs.notes,
      hs.created_at,
      hs.updated_at
    FROM housekeeping_staff hs
    WHERE NOT EXISTS (
      SELECT 1 FROM staff s WHERE s.id = hs.id
    )
    ORDER BY hs.created_at
  LOOP
    -- Generate next employee ID
    max_emp_num := max_emp_num + 1;
    new_emp_id := 'EMP' || LPAD(max_emp_num::TEXT, 4, '0');

    -- Insert the record
    INSERT INTO staff (
      id,
      employee_id,
      full_name,
      email,
      phone,
      department,
      position,
      employment_type,
      employment_status,
      hire_date,
      notes,
      created_at,
      updated_at
    ) VALUES (
      hs_record.id,
      new_emp_id,
      hs_record.full_name,
      hs_record.email,
      hs_record.phone,
      'housekeeping',
      'Housekeeping Staff',
      'full_time',
      CASE
        WHEN hs_record.status = 'active' THEN 'active'
        WHEN hs_record.status = 'on_leave' THEN 'on_leave'
        ELSE 'active'
      END,
      COALESCE(hs_record.created_at::DATE, CURRENT_DATE),
      hs_record.notes,
      hs_record.created_at,
      hs_record.updated_at
    );
  END LOOP;
END $$;

-- Step 2: Drop old foreign key constraint from housekeeping_tasks
ALTER TABLE housekeeping_tasks
  DROP CONSTRAINT IF EXISTS housekeeping_tasks_assigned_to_fkey;

-- Step 3: Add new foreign key constraint to staff table
ALTER TABLE housekeeping_tasks
  ADD CONSTRAINT housekeeping_tasks_assigned_to_fkey
  FOREIGN KEY (assigned_to)
  REFERENCES staff(id)
  ON DELETE SET NULL;

-- Step 4: Update auto_assign function to use staff table with housekeeping department
CREATE OR REPLACE FUNCTION auto_assign_housekeeping_task(task_id UUID)
RETURNS UUID AS $$
DECLARE
  selected_staff_id UUID;
  task_scheduled_time TIMESTAMPTZ;
  task_property_id UUID;
BEGIN
  -- Get task details
  SELECT scheduled_for, property_id INTO task_scheduled_time, task_property_id
  FROM housekeeping_tasks
  WHERE id = task_id;

  -- Find available housekeeping staff member with fewest tasks for that time period
  SELECT s.id INTO selected_staff_id
  FROM staff s
  WHERE s.department = 'housekeeping'
    AND s.employment_status = 'active'
  ORDER BY (
    SELECT COUNT(*)
    FROM housekeeping_tasks ht
    WHERE ht.assigned_to = s.id
      AND ht.scheduled_for::DATE = task_scheduled_time::DATE
      AND ht.status NOT IN ('cancelled', 'completed')
  ) ASC
  LIMIT 1;

  -- If no staff found, return NULL
  IF selected_staff_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Assign the task
  UPDATE housekeeping_tasks
  SET
    assigned_to = selected_staff_id,
    assigned_at = NOW(),
    assignment_method = 'automatic',
    status = 'assigned'
  WHERE id = task_id;

  RETURN selected_staff_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_department_status
  ON staff(department, employment_status)
  WHERE department = 'housekeeping' AND employment_status = 'active';

-- Step 6: Add comment explaining the change
COMMENT ON CONSTRAINT housekeeping_tasks_assigned_to_fkey ON housekeeping_tasks IS
  'References staff table (department=housekeeping) instead of deprecated housekeeping_staff table';

