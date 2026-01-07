-- Create a settings table for business configuration
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings"
ON public.settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete settings
CREATE POLICY "Admins can delete settings"
ON public.settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create seasonal_pricing table for date-range pricing rules
CREATE TABLE public.seasonal_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  multiplier numeric(4,2) NOT NULL DEFAULT 1.0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seasonal_pricing ENABLE ROW LEVEL SECURITY;

-- Only admins can manage seasonal pricing
CREATE POLICY "Admins can view seasonal pricing"
ON public.seasonal_pricing
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert seasonal pricing"
ON public.seasonal_pricing
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update seasonal pricing"
ON public.seasonal_pricing
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete seasonal pricing"
ON public.seasonal_pricing
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_seasonal_pricing_updated_at
BEFORE UPDATE ON public.seasonal_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit_logs table to track configuration changes
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for branding bucket - admins can upload
CREATE POLICY "Admins can upload branding assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

-- Public can view branding assets
CREATE POLICY "Anyone can view branding assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'branding');

-- Admins can update branding assets
CREATE POLICY "Admins can update branding assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete branding assets
CREATE POLICY "Admins can delete branding assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));