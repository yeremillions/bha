import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Vendor {
  id: string;
  name: string;
  company_name?: string;
  specialty: 'plumbing' | 'electrical' | 'hvac' | 'carpentry' | 'painting' | 'maintenance' | 'cleaning' | 'landscaping' | 'security' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  rating: number;
  total_jobs: number;
  completed_jobs: number;
  active: boolean;
  hourly_rate?: number;
  notes?: string;
  license_number?: string;
  insurance_verified: boolean;
  emergency_contact: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorJob {
  id: string;
  job_number: string;
  vendor_id: string;
  maintenance_issue_id?: string;
  property_id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  scheduled_date?: string;
  scheduled_time?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  parts_cost?: number;
  labor_cost?: number;
  payment_status: 'pending' | 'invoiced' | 'paid' | 'overdue';
  invoice_number?: string;
  payment_date?: string;
  assigned_by?: string;
  completed_by?: string;
  rating?: number;
  feedback?: string;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorInput {
  name: string;
  company_name?: string;
  specialty: string;
  phone?: string;
  email?: string;
  address?: string;
  hourly_rate?: number;
  notes?: string;
  license_number?: string;
  insurance_verified?: boolean;
  emergency_contact?: boolean;
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {
  id: string;
}

export interface CreateVendorJobInput {
  vendor_id: string;
  property_id?: string;
  maintenance_issue_id?: string;
  title: string;
  description: string;
  priority?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  notes?: string;
}

export interface UpdateVendorJobInput extends Partial<CreateVendorJobInput> {
  id: string;
  status?: string;
  actual_hours?: number;
  actual_cost?: number;
  parts_cost?: number;
  labor_cost?: number;
  payment_status?: string;
  rating?: number;
  feedback?: string;
}

// ===== VENDOR QUERIES =====

// Fetch all vendors
export const useVendors = (activeOnly = false) => {
  return useQuery({
    queryKey: ['vendors', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('vendors')
        .select('*')
        .order('rating', { ascending: false });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        throw error;
      }

      return data as Vendor[];
    },
  });
};

// Fetch vendors by specialty
export const useVendorsBySpecialty = (specialty: string) => {
  return useQuery({
    queryKey: ['vendors', 'specialty', specialty],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('specialty', specialty)
        .eq('active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching vendors by specialty:', error);
        throw error;
      }

      return data as Vendor[];
    },
  });
};

// Fetch single vendor
export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching vendor:', error);
        throw error;
      }

      return data as Vendor;
    },
    enabled: !!id,
  });
};

// Fetch emergency vendors
export const useEmergencyVendors = () => {
  return useQuery({
    queryKey: ['vendors', 'emergency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('emergency_contact', true)
        .eq('active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching emergency vendors:', error);
        throw error;
      }

      return data as Vendor[];
    },
  });
};

// ===== VENDOR MUTATIONS =====

// Create vendor
export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVendorInput) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating vendor:', error);
      toast.error(error.message || 'Failed to create vendor');
    },
  });
};

// Update vendor
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateVendorInput) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', data.id] });
      toast.success('Vendor updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating vendor:', error);
      toast.error(error.message || 'Failed to update vendor');
    },
  });
};

// Delete vendor (soft delete)
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendors')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting vendor:', error);
      toast.error(error.message || 'Failed to delete vendor');
    },
  });
};

// ===== VENDOR JOB QUERIES =====

// Fetch all vendor jobs
export const useVendorJobs = (vendorId?: string, status?: string) => {
  return useQuery({
    queryKey: ['vendor-jobs', vendorId, status],
    queryFn: async () => {
      let query = supabase
        .from('vendor_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching vendor jobs:', error);
        throw error;
      }

      return data as VendorJob[];
    },
  });
};

// Fetch single vendor job
export const useVendorJob = (id: string) => {
  return useQuery({
    queryKey: ['vendor-jobs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching vendor job:', error);
        throw error;
      }

      return data as VendorJob;
    },
    enabled: !!id,
  });
};

// Fetch jobs for a maintenance issue
export const useVendorJobsByMaintenanceIssue = (maintenanceIssueId: string) => {
  return useQuery({
    queryKey: ['vendor-jobs', 'maintenance', maintenanceIssueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_jobs')
        .select('*')
        .eq('maintenance_issue_id', maintenanceIssueId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor jobs for maintenance issue:', error);
        throw error;
      }

      return data as VendorJob[];
    },
    enabled: !!maintenanceIssueId,
  });
};

// ===== VENDOR JOB MUTATIONS =====

// Create vendor job
export const useCreateVendorJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVendorJobInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate job number
      const { data: jobNum } = await supabase.rpc('generate_vendor_job_number');

      const { data, error } = await supabase
        .from('vendor_jobs')
        .insert([{
          ...input,
          job_number: jobNum || `VJ-${Date.now()}`,
          assigned_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as VendorJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor job created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating vendor job:', error);
      toast.error(error.message || 'Failed to create vendor job');
    },
  });
};

// Update vendor job
export const useUpdateVendorJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateVendorJobInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // If completing the job, add completed_by and completed_at
      const finalUpdates: any = { ...updates };
      if (updates.status === 'completed') {
        finalUpdates.completed_by = user?.id;
        finalUpdates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('vendor_jobs')
        .update(finalUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as VendorJob;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-jobs', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-issues'] }); // If linked to maintenance
      toast.success('Vendor job updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating vendor job:', error);
      toast.error(error.message || 'Failed to update vendor job');
    },
  });
};

// Delete vendor job
export const useDeleteVendorJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-jobs'] });
      toast.success('Vendor job deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting vendor job:', error);
      toast.error(error.message || 'Failed to delete vendor job');
    },
  });
};

// Get vendor performance stats
export const useVendorPerformance = (vendorId: string) => {
  return useQuery({
    queryKey: ['vendor-performance', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_jobs')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) {
        console.error('Error fetching vendor performance:', error);
        throw error;
      }

      const totalJobs = data.length;
      const completedJobs = data.filter(job => job.status === 'completed').length;
      const averageRating = data
        .filter(job => job.rating)
        .reduce((sum, job) => sum + (job.rating || 0), 0) / data.filter(job => job.rating).length || 0;
      const totalCost = data
        .filter(job => job.actual_cost)
        .reduce((sum, job) => sum + (job.actual_cost || 0), 0);
      const averageCost = totalCost / (data.filter(job => job.actual_cost).length || 1);

      return {
        totalJobs,
        completedJobs,
        completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
        averageRating,
        totalCost,
        averageCost,
      };
    },
    enabled: !!vendorId,
  });
};
