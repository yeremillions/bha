import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Property = Tables<'properties'>;
type NewProperty = TablesInsert<'properties'>;
type PropertyUpdate = TablesUpdate<'properties'>;

interface PropertyFilters {
  status?: string;
  type?: string;
  search?: string;
}

// Fetch all properties with optional filters
export const useProperties = (filters?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .order('featured', { ascending: false })
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      return data as Property[];
    },
  });
};

// Fetch a single property by ID
export const useProperty = (id: string | undefined) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        throw error;
      }

      return data as Property;
    },
    enabled: !!id,
  });
};

// Create a new property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProperty: NewProperty) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(newProperty)
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
      }

      return data as Property;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Property created',
        description: `${data.name} has been successfully added.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating property',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update an existing property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PropertyUpdate }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw error;
      }

      return data as Property;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', data.id] });
      toast({
        title: 'Property updated',
        description: `${data.name} has been successfully updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating property',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Mark property as inactive (soft delete)
export const useArchiveProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('properties')
        .update({ status: 'inactive' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error archiving property:', error);
        throw error;
      }

      return data as Property;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', data.id] });
      toast({
        title: 'Property archived',
        description: `${data.name} has been marked as inactive. It will no longer appear in active listings.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error archiving property',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Reactivate an archived property
export const useReactivateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('properties')
        .update({ status: 'available' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error reactivating property:', error);
        throw error;
      }

      return data as Property;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', data.id] });
      toast({
        title: 'Property reactivated',
        description: `${data.name} has been reactivated and is now available for bookings.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error reactivating property',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Delete a property (with dependency check)
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, check if there are any bookings associated with this property
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, booking_number, status')
        .eq('property_id', id)
        .limit(1);

      if (bookingsError) {
        console.error('Error checking property bookings:', bookingsError);
        throw new Error('Failed to check property dependencies');
      }

      // If there are bookings, prevent deletion
      if (bookings && bookings.length > 0) {
        throw new Error(
          'Cannot delete property with existing bookings. Please mark the property as inactive instead.'
        );
      }

      // Check for other dependencies (maintenance, transactions, etc.)
      const { data: maintenance, error: maintenanceError } = await supabase
        .from('maintenance_issues')
        .select('id')
        .eq('property_id', id)
        .limit(1);

      if (maintenanceError) {
        console.error('Error checking maintenance records:', maintenanceError);
      }

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('property_id', id)
        .limit(1);

      if (transactionsError) {
        console.error('Error checking transactions:', transactionsError);
      }

      if ((maintenance && maintenance.length > 0) || (transactions && transactions.length > 0)) {
        throw new Error(
          'Cannot delete property with existing maintenance records or transactions. Please mark the property as inactive instead.'
        );
      }

      // If no dependencies, proceed with deletion
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Property deleted',
        description: 'The property has been successfully removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting property',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Upload property image to storage
export const useUploadPropertyImage = () => {
  return useMutation({
    mutationFn: async ({ propertyId, file }: { propertyId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

      return publicUrl;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Delete property image from storage
export const useDeletePropertyImage = () => {
  return useMutation({
    mutationFn: async (imagePath: string) => {
      // Extract path from URL
      const url = new URL(imagePath);
      const path = url.pathname.split('/property-images/')[1];

      const { error } = await supabase.storage
        .from('property-images')
        .remove([path]);

      if (error) {
        console.error('Error deleting image:', error);
        throw error;
      }

      return imagePath;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Get property statistics
export const usePropertyStats = () => {
  return useQuery({
    queryKey: ['property-stats'],
    queryFn: async () => {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('status, occupancy:bookings!property_id(count)');

      if (error) {
        console.error('Error fetching property stats:', error);
        throw error;
      }

      const total = properties?.length || 0;
      const available = properties?.filter(p => p.status === 'available').length || 0;
      const occupied = properties?.filter(p => p.status === 'occupied').length || 0;
      const maintenance = properties?.filter(p => p.status === 'maintenance').length || 0;

      return {
        total,
        available,
        occupied,
        maintenance,
      };
    },
  });
};
