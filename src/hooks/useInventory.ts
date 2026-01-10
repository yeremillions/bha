import { useQuery, useMutation, useQueryClient } from '@antml:invoke>
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  category?: Database['public']['Tables']['inventory_categories']['Row'];
  supplier?: Database['public']['Tables']['suppliers']['Row'];
};
type NewInventoryItem = Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];
type InventoryCategory = Database['public']['Tables']['inventory_categories']['Row'];
type InventoryAlert = Database['public']['Tables']['inventory_alerts']['Row'] & {
  item?: Database['public']['Tables']['inventory_items']['Row'];
};
type Supplier = Database['public']['Tables']['suppliers']['Row'];
type NewSupplier = Database['public']['Tables']['suppliers']['Insert'];

// Inventory Items
export const useInventoryItems = (status?: string) => {
  return useQuery({
    queryKey: ['inventory-items', status],
    queryFn: async () => {
      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(*),
          supplier:suppliers(*)
        `)
        .order('item_name');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as InventoryItem[];
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newItem: NewInventoryItem) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({ title: 'Inventory item added successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding inventory item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: InventoryItemUpdate }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast({ title: 'Inventory item updated successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating inventory item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({ title: 'Inventory item deleted successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting inventory item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Categories
export const useInventoryCategories = () => {
  return useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');

      if (error) throw new Error(error.message);
      return data as InventoryCategory[];
    },
  });
};

// Suppliers
export const useSuppliers = (status?: string) => {
  return useQuery({
    queryKey: ['suppliers', status],
    queryFn: async () => {
      let query = supabase.from('suppliers').select('*').order('supplier_name');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as Supplier[];
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newSupplier: NewSupplier) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([newSupplier])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Supplier added successfully' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error adding supplier',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Inventory Alerts
export const useInventoryAlerts = (acknowledged?: boolean) => {
  return useQuery({
    queryKey: ['inventory-alerts', acknowledged],
    queryFn: async () => {
      let query = supabase
        .from('inventory_alerts')
        .select(`
          *,
          item:inventory_items(*)
        `)
        .order('created_at', { ascending: false });

      if (acknowledged !== undefined) {
        query = query.eq('is_acknowledged', acknowledged);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data as InventoryAlert[];
    },
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('inventory_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      toast({ title: 'Alert acknowledged' });
    },
  });
};

// Inventory Statistics
export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*');
      if (error) throw new Error(error.message);

      const items = data as InventoryItem[];
      const total = items.length;
      const active = items.filter(i => i.status === 'active').length;
      const lowStock = items.filter(i => i.current_stock <= i.reorder_level).length;
      const outOfStock = items.filter(i => i.current_stock <= 0).length;
      const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0);

      return { total, active, lowStock, outOfStock, totalValue };
    },
  });
};
