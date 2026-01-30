import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

interface AvailabilityFilters {
  checkIn?: string;
  checkOut?: string;
  search?: string;
  type?: string;
  sortBy?: string;
}

export const useAvailableProperties = (filters: AvailabilityFilters) => {
  return useQuery({
    queryKey: ['available-properties', filters],
    queryFn: async () => {
      // First, get all available properties
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('featured', { ascending: false })
        .order('name', { ascending: true });

      const { data: allProperties, error: propertiesError } = await query;

      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
        throw propertiesError;
      }

      let availableProperties = allProperties || [];

      // If date range is provided, filter out properties with conflicting bookings
      if (filters.checkIn && filters.checkOut) {
        const { data: conflictingBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('property_id')
          .not('status', 'eq', 'cancelled')
          .or(`and(check_in_date.lte.${filters.checkOut},check_out_date.gte.${filters.checkIn})`);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          throw bookingsError;
        }

        const bookedPropertyIds = new Set(conflictingBookings?.map(b => b.property_id) || []);
        availableProperties = availableProperties.filter(p => !bookedPropertyIds.has(p.id));
      }

      // Apply client-side filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        availableProperties = availableProperties.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.location.toLowerCase().includes(searchLower)
        );
      }

      if (filters.type && filters.type !== 'all') {
        availableProperties = availableProperties.filter(p => p.type === filters.type);
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low':
            availableProperties.sort((a, b) => a.base_price_per_night - b.base_price_per_night);
            break;
          case 'price-high':
            availableProperties.sort((a, b) => b.base_price_per_night - a.base_price_per_night);
            break;
          case 'rating':
            availableProperties.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case 'featured':
          default:
            availableProperties.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            break;
        }
      }

      return availableProperties as Property[];
    },
  });
};
