import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BarTab {
  id: string;
  tab_number: string;
  booking_id?: string;
  customer_id?: string;
  customer_name: string;
  room_number?: string;
  opened_by?: string;
  opened_at: string;
  closed_at?: string;
  closed_by?: string;
  status: 'open' | 'closed';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method?: 'cash' | 'card' | 'transfer' | 'room_charge';
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BarTabItem {
  id: string;
  tab_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  added_at: string;
  added_by?: string;
  notes?: string;
}

export interface CreateTabInput {
  customer_name: string;
  booking_id?: string;
  customer_id?: string;
  room_number?: string;
  tax_rate?: number;
  notes?: string;
}

export interface AddItemToTabInput {
  tab_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface CloseTabInput {
  tab_id: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'room_charge';
  payment_reference?: string;
  discount_amount?: number;
}

// Fetch all tabs with filters
export const useBarTabs = (status?: 'open' | 'closed') => {
  return useQuery({
    queryKey: ['bar-tabs', status],
    queryFn: async () => {
      let query = supabase
        .from('bar_tabs')
        .select('*')
        .order('opened_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bar tabs:', error);
        throw error;
      }

      return data as BarTab[];
    },
  });
};

// Fetch single tab with items
export const useBarTab = (id: string) => {
  return useQuery({
    queryKey: ['bar-tabs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_tabs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching bar tab:', error);
        throw error;
      }

      return data as BarTab;
    },
    enabled: !!id,
  });
};

// Fetch tab items
export const useBarTabItems = (tabId: string) => {
  return useQuery({
    queryKey: ['bar-tab-items', tabId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_tab_items')
        .select('*')
        .eq('tab_id', tabId)
        .order('added_at', { ascending: true });

      if (error) {
        console.error('Error fetching tab items:', error);
        throw error;
      }

      return data as BarTabItem[];
    },
    enabled: !!tabId,
  });
};

// Create new tab
export const useCreateTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTabInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Generate tab number
      const { data: tabNum } = await supabase.rpc('generate_tab_number');

      const { data, error } = await supabase
        .from('bar_tabs')
        .insert([{
          ...input,
          tab_number: tabNum || `TAB-${Date.now()}`,
          opened_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as BarTab;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-tabs'] });
      toast.success('Tab opened successfully');
    },
    onError: (error: any) => {
      console.error('Error creating tab:', error);
      toast.error(error.message || 'Failed to open tab');
    },
  });
};

// Add item to tab
export const useAddItemToTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddItemToTabInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('bar_tab_items')
        .insert([{
          ...input,
          added_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as BarTabItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bar-tabs'] });
      queryClient.invalidateQueries({ queryKey: ['bar-tabs', variables.tab_id] });
      queryClient.invalidateQueries({ queryKey: ['bar-tab-items', variables.tab_id] });
      toast.success('Item added to tab');
    },
    onError: (error: any) => {
      console.error('Error adding item to tab:', error);
      toast.error(error.message || 'Failed to add item to tab');
    },
  });
};

// Remove item from tab
export const useRemoveItemFromTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, tabId }: { itemId: string; tabId: string }) => {
      const { error } = await supabase
        .from('bar_tab_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return { itemId, tabId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bar-tabs'] });
      queryClient.invalidateQueries({ queryKey: ['bar-tabs', data.tabId] });
      queryClient.invalidateQueries({ queryKey: ['bar-tab-items', data.tabId] });
      toast.success('Item removed from tab');
    },
    onError: (error: any) => {
      console.error('Error removing item from tab:', error);
      toast.error(error.message || 'Failed to remove item');
    },
  });
};

// Update tab item quantity
export const useUpdateTabItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, tabId, quantity }: { itemId: string; tabId: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('bar_tab_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return { data, tabId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bar-tabs'] });
      queryClient.invalidateQueries({ queryKey: ['bar-tabs', result.tabId] });
      queryClient.invalidateQueries({ queryKey: ['bar-tab-items', result.tabId] });
      toast.success('Quantity updated');
    },
    onError: (error: any) => {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Failed to update quantity');
    },
  });
};

// Close tab
export const useCloseTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tab_id, payment_method, payment_reference, discount_amount }: CloseTabInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('bar_tabs')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_by: user?.id,
          payment_method,
          payment_reference,
          discount_amount: discount_amount || 0,
        })
        .eq('id', tab_id)
        .select()
        .single();

      if (error) throw error;
      return data as BarTab;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-tabs'] });
      queryClient.invalidateQueries({ queryKey: ['bar-items'] }); // Stock was deducted
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Transaction was created
      toast.success('Tab closed successfully');
    },
    onError: (error: any) => {
      console.error('Error closing tab:', error);
      toast.error(error.message || 'Failed to close tab');
    },
  });
};

// Get today's bar revenue
export const useBarRevenueToday = () => {
  return useQuery({
    queryKey: ['bar-revenue-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('bar_tabs')
        .select('total')
        .eq('status', 'closed')
        .gte('closed_at', today.toISOString());

      if (error) {
        console.error('Error fetching bar revenue:', error);
        throw error;
      }

      const totalRevenue = data.reduce((sum, tab) => sum + tab.total, 0);
      return totalRevenue;
    },
  });
};

// Get bar sales statistics
export const useBarSalesStats = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['bar-sales-stats', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('bar_tabs')
        .select('*')
        .eq('status', 'closed');

      if (startDate) {
        query = query.gte('closed_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('closed_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bar sales stats:', error);
        throw error;
      }

      const totalRevenue = data.reduce((sum, tab) => sum + tab.total, 0);
      const totalTabs = data.length;
      const averageTabValue = totalTabs > 0 ? totalRevenue / totalTabs : 0;

      return {
        totalRevenue,
        totalTabs,
        averageTabValue,
        tabs: data as BarTab[],
      };
    },
  });
};

// Get items sold today
export const useItemsSoldToday = () => {
  return useQuery({
    queryKey: ['items-sold-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all closed tabs from today
      const { data: tabs, error: tabsError } = await supabase
        .from('bar_tabs')
        .select('id')
        .eq('status', 'closed')
        .gte('closed_at', today.toISOString());

      if (tabsError) {
        console.error('Error fetching tabs:', tabsError);
        throw tabsError;
      }

      if (!tabs || tabs.length === 0) {
        return 0;
      }

      const tabIds = tabs.map(tab => tab.id);

      // Get all items from those tabs
      const { data: items, error: itemsError } = await supabase
        .from('bar_tab_items')
        .select('quantity')
        .in('tab_id', tabIds);

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
        throw itemsError;
      }

      const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return totalItems;
    },
  });
};
