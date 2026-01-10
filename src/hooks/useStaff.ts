import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Staff = Database['public']['Tables']['staff']['Row'];
type NewStaff = Database['public']['Tables']['staff']['Insert'];
type StaffUpdate = Database['public']['Tables']['staff']['Update'];

// Staff CRUD hooks
export const useStaff = (status?: string) => {
  return useQuery({
    queryKey: ['staff', status],
    queryFn: async () => {
      let query = supabase.from('staff').select('*').order('full_name');

      if (status) {
        query = query.eq('employment_status', status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Staff[];
    },
  });
};

export const useStaffById = (id: string) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as Staff;
    },
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newStaff: NewStaff) => {
      const { data, error } = await supabase
        .from('staff')
        .insert([newStaff])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Staff member added successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding staff member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: StaffUpdate }) => {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Staff member updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating staff member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Staff member deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting staff member',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Staff statistics
export const useStaffStats = () => {
  return useQuery({
    queryKey: ['staff-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('staff').select('*');
      if (error) throw new Error(error.message);

      const staff = data as Staff[];
      const total = staff.length;
      const active = staff.filter(s => s.employment_status === 'active').length;
      const onLeave = staff.filter(s => s.employment_status === 'on_leave').length;
      const inactive = staff.filter(s => s.employment_status === 'inactive').length;

      const byDepartment = staff.reduce((acc, s) => {
        acc[s.department] = (acc[s.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, active, onLeave, inactive, byDepartment };
    },
  });
};
