-- ============================================================================
-- HOUSEKEEPING MODULE
-- ============================================================================
-- This migration creates tables for managing housekeeping tasks and staff
-- Supports both manual and automatic task assignment workflows

-- ============================================================================
-- HOUSEKEEPING STAFF TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS housekeeping_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_tasks_completed INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- HOUSEKEEPING TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number TEXT UNIQUE NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Task details
  task_type TEXT NOT NULL CHECK (task_type IN ('checkout_clean', 'turnover', 'regular_clean', 'deep_clean', 'inspection', 'maintenance_support')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  status TEXT NOT NULL DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'assigned', 'in_progress', 'completed', 'cancelled')),

  -- Assignment
  assigned_to UUID REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  assignment_method TEXT CHECK (assignment_method IN ('manual', 'automatic')),

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER DEFAULT 120,
  actual_duration_minutes INTEGER,

  -- Task notes and checklist
  description TEXT,
  special_instructions TEXT,
  completion_notes TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,

  -- Quality control
  inspection_required BOOLEAN DEFAULT false,
  inspection_passed BOOLEAN,
  inspected_by UUID REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
  inspected_at TIMESTAMPTZ,
  quality_rating DECIMAL(2, 1) CHECK (quality_rating >= 0 AND quality_rating <= 5),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SYSTEM SETTINGS TABLE (for housekeeping configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default housekeeping settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
  ('housekeeping_assignment_mode', '"automatic"'::jsonb, 'Assignment mode: "manual" or "automatic"'),
  ('housekeeping_auto_create_on_checkout', 'true'::jsonb, 'Automatically create housekeeping tasks on checkout')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_housekeeping_tasks_property ON housekeeping_tasks(property_id);
CREATE INDEX idx_housekeeping_tasks_booking ON housekeeping_tasks(booking_id);
CREATE INDEX idx_housekeeping_tasks_assigned_to ON housekeeping_tasks(assigned_to);
CREATE INDEX idx_housekeeping_tasks_status ON housekeeping_tasks(status);
CREATE INDEX idx_housekeeping_tasks_scheduled ON housekeeping_tasks(scheduled_for);
CREATE INDEX idx_housekeeping_staff_status ON housekeeping_staff(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_housekeeping_staff_updated_at
  BEFORE UPDATE ON housekeeping_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housekeeping_tasks_updated_at
  BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Generate task number
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_task_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  task_number TEXT;
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(task_number FROM 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM housekeeping_tasks
  WHERE task_number ~ '^CL[0-9]+$';

  -- Format as CL001, CL002, etc.
  task_number := 'CL' || LPAD(next_number::TEXT, 3, '0');

  RETURN task_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Auto-assign task to available staff
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_assign_housekeeping_task(task_id UUID)
RETURNS UUID AS $$
DECLARE
  selected_staff_id UUID;
  task_scheduled_time TIMESTAMPTZ;
BEGIN
  -- Get the scheduled time for this task
  SELECT scheduled_for INTO task_scheduled_time
  FROM housekeeping_tasks
  WHERE id = task_id;

  -- Find available staff member with lowest current workload
  -- Prioritize by: active status, fewest tasks on same day, highest rating
  SELECT s.id INTO selected_staff_id
  FROM housekeeping_staff s
  WHERE s.status = 'active'
  ORDER BY
    -- Count of tasks assigned for the same day
    (SELECT COUNT(*)
     FROM housekeeping_tasks t
     WHERE t.assigned_to = s.id
       AND DATE(t.scheduled_for) = DATE(task_scheduled_time)
       AND t.status IN ('assigned', 'in_progress')) ASC,
    -- Prefer higher rated staff
    s.rating DESC,
    -- Prefer more experienced staff
    s.total_tasks_completed DESC
  LIMIT 1;

  -- Update the task with assignment
  IF selected_staff_id IS NOT NULL THEN
    UPDATE housekeeping_tasks
    SET
      assigned_to = selected_staff_id,
      assigned_at = now(),
      assignment_method = 'automatic',
      status = 'assigned'
    WHERE id = task_id;
  END IF;

  RETURN selected_staff_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Create housekeeping task on booking completion
-- ============================================================================
CREATE OR REPLACE FUNCTION create_checkout_housekeeping_task()
RETURNS TRIGGER AS $$
DECLARE
  auto_create BOOLEAN;
  assignment_mode TEXT;
  new_task_id UUID;
  task_num TEXT;
BEGIN
  -- Only proceed if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Check if auto-creation is enabled
    SELECT (setting_value)::boolean INTO auto_create
    FROM system_settings
    WHERE setting_key = 'housekeeping_auto_create_on_checkout';

    IF auto_create THEN
      -- Get assignment mode
      SELECT (setting_value)::text INTO assignment_mode
      FROM system_settings
      WHERE setting_key = 'housekeeping_assignment_mode';

      -- Remove quotes from JSON string
      assignment_mode := TRIM(BOTH '"' FROM assignment_mode);

      -- Generate task number
      task_num := generate_task_number();

      -- Create the housekeeping task
      INSERT INTO housekeeping_tasks (
        task_number,
        property_id,
        booking_id,
        task_type,
        priority,
        status,
        scheduled_for,
        estimated_duration_minutes,
        description
      )
      VALUES (
        task_num,
        NEW.property_id,
        NEW.id,
        'checkout_clean',
        'urgent', -- Checkout cleans are always urgent
        'unassigned',
        NEW.check_out_date, -- Schedule for checkout date
        180, -- 3 hours for checkout clean
        'Post-checkout deep clean for booking ' || NEW.booking_number
      )
      RETURNING id INTO new_task_id;

      -- If automatic assignment is enabled, assign immediately
      IF assignment_mode = 'automatic' THEN
        PERFORM auto_assign_housekeeping_task(new_task_id);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic task creation
DROP TRIGGER IF EXISTS trigger_create_checkout_task ON bookings;
CREATE TRIGGER trigger_create_checkout_task
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_checkout_housekeeping_task();

-- ============================================================================
-- FUNCTION: Update staff task completion count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_staff_task_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When a task is completed, increment the staff member's total
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF NEW.assigned_to IS NOT NULL THEN
      UPDATE housekeeping_staff
      SET
        total_tasks_completed = total_tasks_completed + 1,
        rating = CASE
          WHEN NEW.quality_rating IS NOT NULL THEN
            -- Update running average rating
            ((rating * total_tasks_completed) + NEW.quality_rating) / (total_tasks_completed + 1)
          ELSE
            rating
        END
      WHERE id = NEW.assigned_to;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_staff_stats
  AFTER UPDATE ON housekeeping_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_task_count();

-- ============================================================================
-- SEED DATA: Sample housekeeping staff
-- ============================================================================
INSERT INTO housekeeping_staff (full_name, phone, email, status, rating, total_tasks_completed)
VALUES
  ('Mary Obi', '+234 803 123 4567', 'mary.obi@example.com', 'active', 4.9, 142),
  ('Grace Eze', '+234 805 234 5678', 'grace.eze@example.com', 'active', 4.8, 165),
  ('Blessing Okoro', '+234 807 345 6789', 'blessing.okoro@example.com', 'active', 4.7, 98),
  ('Fatima Ibrahim', '+234 809 456 7890', 'fatima.ibrahim@example.com', 'active', 4.9, 120)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE housekeeping_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all housekeeping data
CREATE POLICY "Allow authenticated users to read staff"
  ON housekeeping_staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage staff"
  ON housekeeping_staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read tasks"
  ON housekeeping_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage tasks"
  ON housekeeping_tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
