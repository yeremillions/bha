-- ============================================================================
-- STAFF MANAGEMENT MODULE
-- Comprehensive HR system for all staff types (not just housekeeping)
-- ============================================================================

-- Staff table (general staff for all departments)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  -- Employment details
  department TEXT NOT NULL, -- reception, bar, maintenance, security, management, housekeeping
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full_time', -- full_time, part_time, contract, casual
  employment_status TEXT NOT NULL DEFAULT 'active', -- active, on_leave, suspended, terminated

  -- Dates
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  termination_date DATE,

  -- Compensation
  base_salary DECIMAL(10, 2),
  salary_currency TEXT DEFAULT 'NGN',
  payment_frequency TEXT DEFAULT 'monthly', -- monthly, weekly, daily

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,

  -- Documents & Notes
  documents JSONB, -- Array of document references
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift schedules
CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- morning, afternoon, evening, night
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance tracking
CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES staff_shifts(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  status TEXT NOT NULL, -- present, absent, late, half_day, on_leave
  hours_worked DECIMAL(5, 2),
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests
CREATE TABLE IF NOT EXISTS staff_leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL, -- annual, sick, casual, maternity, paternity, unpaid
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance reviews
CREATE TABLE IF NOT EXISTS staff_performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  reviewer_id UUID REFERENCES staff(id),

  -- Ratings (1-5 scale)
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  quality_of_work_rating INTEGER CHECK (quality_of_work_rating BETWEEN 1 AND 5),
  teamwork_rating INTEGER CHECK (teamwork_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),

  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  comments TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_employment_status ON staff(employment_status);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_id ON staff_shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff_id ON staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_staff_leave_staff_id ON staff_leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_status ON staff_leave_requests(status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

CREATE TRIGGER staff_shifts_updated_at BEFORE UPDATE ON staff_shifts
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

CREATE TRIGGER staff_attendance_updated_at BEFORE UPDATE ON staff_attendance
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

CREATE TRIGGER staff_leave_requests_updated_at BEFORE UPDATE ON staff_leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

-- RLS Policies
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON staff FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON staff FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON staff FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON staff_shifts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON staff_shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON staff_shifts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON staff_shifts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON staff_attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON staff_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON staff_attendance FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON staff_attendance FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON staff_leave_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON staff_leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON staff_leave_requests FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON staff_leave_requests FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON staff_performance_reviews FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON staff_performance_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON staff_performance_reviews FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON staff_performance_reviews FOR DELETE USING (true);

-- Generate employee ID automatically
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'EMP' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM staff WHERE employee_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Set default employee_id if not provided
CREATE OR REPLACE FUNCTION set_employee_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_id IS NULL OR NEW.employee_id = '' THEN
    NEW.employee_id := generate_employee_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_employee_id_trigger BEFORE INSERT ON staff
  FOR EACH ROW EXECUTE FUNCTION set_employee_id();

-- Calculate hours worked in attendance
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_in_time IS NOT NULL AND NEW.clock_out_time IS NOT NULL THEN
    NEW.hours_worked := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_hours_trigger BEFORE INSERT OR UPDATE ON staff_attendance
  FOR EACH ROW EXECUTE FUNCTION calculate_attendance_hours();
