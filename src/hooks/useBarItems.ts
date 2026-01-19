import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type BarItem = Tables<'bar_items'>;

export interface CreateBarItemInput {
  name: string;
  category: string;
  price: number;
  cost?: number;
  stock_quantity?: number;
  min_stock_level?: number;
  unit?: string;
  active?: boolean;
  image_url?: string;
  description?: string;
}

export interface UpdateBarItemInput extends Partial<CreateBarItemInput> {
  id: string;
}

// Fetch all bar items
export const useBarItems = (activeOnly = false) => {
  return useQuery({
    queryKey: ['bar-items', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('bar_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bar items:', error);
        throw error;
      }

      return data;
    },
  });
};

// Fetch bar items by category
export const useBarItemsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['bar-items', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_items')
        .select('*')
        .eq('category', category)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching bar items by category:', error);
        throw error;
      }

      return data;
    },
  });
};

// Fetch single bar item
export const useBarItem = (id: string) => {
  return useQuery({
    queryKey: ['bar-items', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching bar item:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Fetch low stock items
export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['bar-items', 'low-stock'],
    queryFn: async () => {
      // Get items where stock is below minimum level
      const { data, error } = await supabase
        .from('bar_items')
        .select('*')
        .eq('active', true);

      if (error) {
        console.error('Error fetching low stock items:', error);
        throw error;
      }

      // Filter items where stock is below minimum
      return data?.filter(item => 
        (item.stock_quantity || 0) < (item.min_stock_level || 0)
      ) || [];
    },
  });
};

// Create bar item
export const useCreateBarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBarItemInput) => {
      const { data, error } = await supabase
        .from('bar_items')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-items'] });
      toast.success('Bar item created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating bar item:', error);
      toast.error(error.message || 'Failed to create bar item');
    },
  });
};

// Update bar item
export const useUpdateBarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateBarItemInput) => {
      const { data, error } = await supabase
        .from('bar_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bar-items'] });
      if (data) queryClient.invalidateQueries({ queryKey: ['bar-items', data.id] });
      toast.success('Bar item updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating bar item:', error);
      toast.error(error.message || 'Failed to update bar item');
    },
  });
};

// Delete bar item (soft delete by setting active = false)
export const useDeleteBarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bar_items')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-items'] });
      toast.success('Bar item deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting bar item:', error);
      toast.error(error.message || 'Failed to delete bar item');
    },
  });
};

// Update stock quantity
export const useUpdateBarItemStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('bar_items')
        .update({ stock_quantity: quantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-items'] });
      toast.success('Stock updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating stock:', error);
      toast.error(error.message || 'Failed to update stock');
    },
  });
};

// Get bar inventory value
export const useBarInventoryValue = () => {
  return useQuery({
    queryKey: ['bar-inventory-value'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_items')
        .select('cost, stock_quantity')
        .eq('active', true);

      if (error) {
        console.error('Error calculating inventory value:', error);
        throw error;
      }

      const totalValue = (data || []).reduce((sum, item) => {
        return sum + (item.cost || 0) * (item.stock_quantity || 0);
      }, 0);

      return totalValue;
    },
  });
};
