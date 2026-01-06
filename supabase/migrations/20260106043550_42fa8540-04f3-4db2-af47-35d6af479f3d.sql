-- Create maintenance_issues table
CREATE TABLE public.maintenance_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_issues ENABLE ROW LEVEL SECURITY;

-- Users can view their own issues
CREATE POLICY "Users can view their own issues"
ON public.maintenance_issues
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all issues
CREATE POLICY "Admins can view all issues"
ON public.maintenance_issues
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can create their own issues
CREATE POLICY "Users can create their own issues"
ON public.maintenance_issues
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own issues
CREATE POLICY "Users can update their own issues"
ON public.maintenance_issues
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can update any issue
CREATE POLICY "Admins can update any issue"
ON public.maintenance_issues
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own issues
CREATE POLICY "Users can delete their own issues"
ON public.maintenance_issues
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can delete any issue
CREATE POLICY "Admins can delete any issue"
ON public.maintenance_issues
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_issues_updated_at
BEFORE UPDATE ON public.maintenance_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_maintenance_issues_user_id ON public.maintenance_issues(user_id);
CREATE INDEX idx_maintenance_issues_status ON public.maintenance_issues(status);
CREATE INDEX idx_maintenance_issues_priority ON public.maintenance_issues(priority);