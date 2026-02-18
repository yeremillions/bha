import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Types
export type Customer = Tables<'customers'>;

export interface CustomerFilters {
  search?: string;
  vipStatus?: boolean;
}

export interface NewCustomer {
  full_name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  date_of_birth?: string;
  nationality?: string;
  id_type?: 'passport' | 'drivers_license' | 'national_id';
  id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferences?: Record<string, any>;
  vip_status?: boolean;
  notes?: string;
}

export interface UpdateCustomer {
  full_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  date_of_birth?: string;
  nationality?: string;
  id_type?: 'passport' | 'drivers_license' | 'national_id';
  id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferences?: Record<string, any>;
  vip_status?: boolean;
  notes?: string;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch all customers with optional filters
 */
export const useCustomers = (filters?: CustomerFilters) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('*, bookings(id, total_amount, status, payment_status, created_at)')
        .order('created_at', { ascending: false });

      // Apply filters (same as before)
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }
      if (filters?.vipStatus !== undefined) {
        query = query.eq('vip_status', filters.vipStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }

      // Calculate stats from bookings
      const customersWithStats = data.map((customer: any) => {
        const bookings = customer.bookings || [];

        // Calculate total bookings (excluding cancelled)
        const validBookings = bookings.filter((b: any) => b.status !== 'cancelled');
        const totalBookings = validBookings.length;

        // Calculate total spent (only paid/completed or confirmed bookings)
        // Adjust logic based on business rules: usually 'confirmed' or 'checked_in' or 'completed'
        // For revenue, we ideally check payment_status === 'paid'
        const totalSpent = bookings.reduce((sum: number, b: any) => {
          if (b.status !== 'cancelled' && (b.payment_status === 'paid' || b.status === 'completed' || b.status === 'checked_in')) {
            return sum + (b.total_amount || 0);
          }
          return sum;
        }, 0);

        // Calculate average rating (mock for now if not in DB, but customer table has it)
        // If we had reviews table, we'd fetch that too. 
        // For now, keep existing average_rating or 0.

        return {
          ...customer,
          total_bookings: totalBookings,
          total_spent: totalSpent,
          // We can also calculate last_booking_date if needed
          last_booking_date: bookings.length > 0
            ? bookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null
        };
      });

      return customersWithStats as Customer[];
    },
  });
};

/**
 * Fetch a single customer by ID
 */
export const useCustomer = (id: string | undefined) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required');

      const { data, error } = await supabase
        .from('customers')
        .select('*, bookings(id, total_amount, status, payment_status, created_at)')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
        throw new Error(`Failed to fetch customer: ${error.message}`);
      }

      // Calculate stats from bookings
      const bookings = (data as any).bookings || [];
      const validBookings = bookings.filter((b: any) => b.status !== 'cancelled');
      const totalBookings = validBookings.length;

      const totalSpent = bookings.reduce((sum: number, b: any) => {
        if (b.status !== 'cancelled' && (b.payment_status === 'paid' || b.status === 'completed' || b.status === 'checked_in')) {
          return sum + (b.total_amount || 0);
        }
        return sum;
      }, 0);

      const customerWithStats = {
        ...data,
        total_bookings: totalBookings,
        total_spent: totalSpent,
        last_booking_date: bookings.length > 0
          ? bookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null
      };

      return customerWithStats as Customer;
    },
    enabled: !!id,
  });
};

/**
 * Fetch customer by email
 */
export const useCustomerByEmail = (email: string | undefined) => {
  return useQuery({
    queryKey: ['customer', 'email', email],
    queryFn: async () => {
      if (!email) throw new Error('Customer email is required');

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer by email:', error);
        throw new Error(`Failed to fetch customer: ${error.message}`);
      }

      return data as Customer | null;
    },
    enabled: !!email,
  });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new customer
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCustomer: NewCustomer) => {
      // Check if customer with email already exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', newCustomer.email)
        .maybeSingle();

      if (existing) {
        throw new Error('A customer with this email already exists');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw new Error(`Failed to create customer: ${error.message}`);
      }

      return data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Customer created',
        description: `${data.full_name} has been added successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating customer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update an existing customer
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCustomer }) => {
      // If email is being updated, check for duplicates
      if (updates.email) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('email', updates.email)
          .neq('id', id)
          .maybeSingle();

        if (existing) {
          throw new Error('A customer with this email already exists');
        }
      }

      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw new Error(`Failed to update customer: ${error.message}`);
      }

      return data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast({
        title: 'Customer updated',
        description: `${data.full_name}'s information has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating customer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Delete a customer
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        // Check if it's a foreign key constraint error
        if (error.code === '23503') {
          throw new Error('Cannot delete customer with existing bookings');
        }
        throw new Error(`Failed to delete customer: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Customer deleted',
        description: 'The customer has been permanently deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting customer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Toggle VIP status
 */
export const useToggleVIPStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vipStatus }: { id: string; vipStatus: boolean }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({ vip_status: vipStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating VIP status:', error);
        throw new Error(`Failed to update VIP status: ${error.message}`);
      }

      return data as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast({
        title: data.vip_status ? 'VIP status granted' : 'VIP status removed',
        description: `${data.full_name} is ${data.vip_status ? 'now' : 'no longer'} a VIP customer.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating VIP status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
