-- =====================================================
-- Brooklyn Hills Apartments - Vendor Management System
-- Created: January 15, 2026
-- =====================================================

-- =====================================================
-- 1. VENDORS TABLE
-- =====================================================

CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text,
  specialty text NOT NULL CHECK (specialty IN ('plumbing', 'electrical', 'hvac', 'carpentry', 'painting', 'maintenance', 'cleaning', 'landscaping', 'security', 'other')),
  phone text,
  email text,
  address text,
  rating numeric(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5.0),
  total_jobs integer DEFAULT 0 CHECK (total_jobs >= 0),
  completed_jobs integer DEFAULT 0 CHECK (completed_jobs >= 0),
  active boolean DEFAULT true,
  hourly_rate numeric(8,2),
  notes text,
  license_number text,
  insurance_verified boolean DEFAULT false,
  emergency_contact boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_vendors_specialty ON public.vendors(specialty);
CREATE INDEX idx_vendors_active ON public.vendors(active) WHERE active = true;
CREATE INDEX idx_vendors_rating ON public.vendors(rating DESC);
CREATE INDEX idx_vendors_emergency ON public.vendors(emergency_contact) WHERE emergency_contact = true;

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view vendors"
ON public.vendors
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and facility managers can manage vendors"
ON public.vendors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'facility_manager')
  )
);

-- =====================================================
-- 2. VENDOR JOBS TABLE
-- =====================================================

CREATE TABLE public.vendor_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number text UNIQUE NOT NULL,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  maintenance_issue_id uuid REFERENCES public.maintenance_issues(id),
  property_id uuid REFERENCES public.properties(id),
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  scheduled_date date,
  scheduled_time time,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_hours numeric(8,2),
  actual_hours numeric(8,2),
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  parts_cost numeric(10,2) DEFAULT 0,
  labor_cost numeric(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'invoiced', 'paid', 'overdue')),
  invoice_number text,
  payment_date date,
  assigned_by uuid REFERENCES auth.users(id),
  completed_by uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  images text[] DEFAULT '{}',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Generate job number function
CREATE OR REPLACE FUNCTION generate_vendor_job_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  new_job_number text;
BEGIN
  -- Get the highest job number
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS integer)), 0) + 1
  INTO next_number
  FROM public.vendor_jobs;

  -- Format as VJ001, VJ002, etc.
  new_job_number := 'VJ' || LPAD(next_number::text, 4, '0');

  RETURN new_job_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate job number
CREATE OR REPLACE FUNCTION set_vendor_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_vendor_job_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vendor_job_number_trigger
BEFORE INSERT ON public.vendor_jobs
FOR EACH ROW
EXECUTE FUNCTION set_vendor_job_number();

-- Index for common queries
CREATE INDEX idx_vendor_jobs_vendor ON public.vendor_jobs(vendor_id);
CREATE INDEX idx_vendor_jobs_property ON public.vendor_jobs(property_id);
CREATE INDEX idx_vendor_jobs_maintenance ON public.vendor_jobs(maintenance_issue_id);
CREATE INDEX idx_vendor_jobs_status ON public.vendor_jobs(status);
CREATE INDEX idx_vendor_jobs_priority ON public.vendor_jobs(priority);
CREATE INDEX idx_vendor_jobs_scheduled ON public.vendor_jobs(scheduled_date);

-- Enable RLS
ALTER TABLE public.vendor_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view vendor jobs"
ON public.vendor_jobs
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and facility managers can manage vendor jobs"
ON public.vendor_jobs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'facility_manager', 'maintenance')
  )
);

-- =====================================================
-- 3. FUNCTIONS TO UPDATE VENDOR STATS
-- =====================================================

-- Function to update vendor stats on job completion
CREATE OR REPLACE FUNCTION update_vendor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vendor stats when job status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.vendors
    SET
      total_jobs = (SELECT COUNT(*) FROM public.vendor_jobs WHERE vendor_id = NEW.vendor_id),
      completed_jobs = (SELECT COUNT(*) FROM public.vendor_jobs WHERE vendor_id = NEW.vendor_id AND status = 'completed'),
      rating = (SELECT AVG(rating) FROM public.vendor_jobs WHERE vendor_id = NEW.vendor_id AND rating IS NOT NULL),
      updated_at = now()
    WHERE id = NEW.vendor_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update vendor stats
CREATE TRIGGER update_vendor_stats_on_job_change
AFTER INSERT OR UPDATE ON public.vendor_jobs
FOR EACH ROW
EXECUTE FUNCTION update_vendor_stats();

-- =====================================================
-- 4. FUNCTION TO CREATE TRANSACTION ON JOB PAYMENT
-- =====================================================

CREATE OR REPLACE FUNCTION create_vendor_payment_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Create transaction when job is marked as paid
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    INSERT INTO public.transactions (
      transaction_type,
      category,
      amount,
      payment_method,
      description,
      reference_number,
      transaction_date,
      created_by
    ) VALUES (
      'expense',
      'vendor_services',
      NEW.actual_cost,
      'transfer', -- Assuming transfer, can be updated
      'Vendor job: ' || NEW.job_number || ' - ' || NEW.title,
      NEW.invoice_number,
      NEW.payment_date,
      NEW.completed_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create transaction on payment
CREATE TRIGGER create_vendor_payment_transaction_trigger
AFTER UPDATE ON public.vendor_jobs
FOR EACH ROW
EXECUTE FUNCTION create_vendor_payment_transaction();

-- =====================================================
-- 5. FUNCTION TO LINK MAINTENANCE ISSUE TO VENDOR JOB
-- =====================================================

CREATE OR REPLACE FUNCTION link_maintenance_issue_to_vendor()
RETURNS TRIGGER AS $$
BEGIN
  -- Update maintenance issue status when vendor job is assigned
  IF NEW.maintenance_issue_id IS NOT NULL AND NEW.status = 'scheduled' THEN
    UPDATE public.maintenance_issues
    SET
      status = 'in_progress',
      updated_at = now()
    WHERE id = NEW.maintenance_issue_id;
  END IF;

  -- Update maintenance issue when vendor job is completed
  IF NEW.maintenance_issue_id IS NOT NULL AND NEW.status = 'completed' THEN
    UPDATE public.maintenance_issues
    SET
      status = 'resolved',
      resolved_at = NEW.completed_at,
      updated_at = now()
    WHERE id = NEW.maintenance_issue_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to link maintenance issues
CREATE TRIGGER link_maintenance_issue_trigger
AFTER INSERT OR UPDATE ON public.vendor_jobs
FOR EACH ROW
EXECUTE FUNCTION link_maintenance_issue_to_vendor();

-- =====================================================
-- 6. UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_jobs_updated_at
BEFORE UPDATE ON public.vendor_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. SEED DATA (Sample Vendors)
-- =====================================================

INSERT INTO public.vendors (name, company_name, specialty, phone, email, rating, total_jobs, completed_jobs, hourly_rate, emergency_contact, insurance_verified) VALUES
  ('John''s Plumbing Services', 'J&K Plumbing Ltd', 'plumbing', '+234 803 123 4567', 'john@jkplumbing.com', 4.8, 45, 42, 8500, true, true),
  ('Bright Spark Electrical', 'Bright Spark Ltd', 'electrical', '+234 805 234 5678', 'info@brightspark.ng', 4.5, 38, 35, 9000, true, true),
  ('Cool Breeze HVAC', 'Cool Breeze Systems', 'hvac', '+234 807 345 6789', 'service@coolbreeze.ng', 4.9, 32, 31, 12000, true, true),
  ('Master Carpenter Services', NULL, 'carpentry', '+234 809 456 7890', 'mastercarpenter@gmail.com', 4.3, 28, 25, 7000, false, false),
  ('Rainbow Painting Co', 'Rainbow Paint Ltd', 'painting', '+234 801 567 8901', 'info@rainbowpaint.ng', 4.6, 22, 20, 6500, false, true),
  ('Fix-It Maintenance', 'Fix-It Services Ltd', 'maintenance', '+234 803 678 9012', 'contact@fixit.ng', 4.7, 56, 52, 7500, true, true),
  ('Green Gardens Landscaping', 'Green Gardens Ltd', 'landscaping', '+234 805 789 0123', 'info@greengardens.ng', 4.4, 18, 17, 8000, false, true),
  ('SecureGuard Services', 'SecureGuard Ltd', 'security', '+234 807 890 1234', 'admin@secureguard.ng', 4.2, 12, 12, 5000, true, true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.vendors TO authenticated;
GRANT ALL ON public.vendor_jobs TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Vendor management tables created successfully!';
  RAISE NOTICE 'Tables: vendors, vendor_jobs';
  RAISE NOTICE 'Sample data: 8 vendors inserted';
END $$;
