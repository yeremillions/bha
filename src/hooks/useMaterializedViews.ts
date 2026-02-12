import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MaterializedViewStatus {
  name: string;
  last_refresh: string | null;
  row_count: number;
  size: string;
}

export interface RefreshResult {
  view: string;
  success: boolean;
  error?: string;
}

/**
 * Hook to fetch materialized view status
 */
export const useMaterializedViewStatus = () => {
  return useQuery({
    queryKey: ['materialized-views', 'status'],
    queryFn: async (): Promise<MaterializedViewStatus[]> => {
      const { data, error } = await supabase.rpc('get_materialized_view_status');

      if (error) {
        console.error('Error fetching materialized view status:', error);
        throw new Error(`Failed to fetch view status: ${error.message}`);
      }

      return (data || []) as MaterializedViewStatus[];
    },
    // Refresh every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Hook to refresh materialized views via Edge Function
 */
export const useRefreshMaterializedViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (views?: string[]): Promise<RefreshResult[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/refresh-materialized-views`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ views }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refresh views');
      }

      const result = await response.json();
      return result.results as RefreshResult[];
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        toast({
          title: 'Views refreshed',
          description: `Successfully refreshed ${successCount} materialized view(s).`,
        });
      } else {
        toast({
          title: 'Partial refresh',
          description: `${successCount} succeeded, ${failCount} failed. Check console for details.`,
          variant: 'destructive',
        });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['materialized-views'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Refresh failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to refresh materialized views directly via RPC (fallback if edge function not available)
 */
export const useRefreshMaterializedViewsRPC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (viewName: string = 'mv_revenue_summary'): Promise<void> => {
      const { error } = await supabase.rpc('refresh_materialized_view', {
        view_name: viewName,
      });

      if (error) {
        console.error('Error refreshing materialized view:', error);
        throw new Error(`Failed to refresh view: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: 'View refreshed',
        description: 'Materialized view refreshed successfully.',
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['materialized-views'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Refresh failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to check if revenue summary should be refreshed
 */
export const useShouldRefreshRevenueSummary = () => {
  return useQuery({
    queryKey: ['materialized-views', 'should-refresh'],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc('should_refresh_revenue_summary');

      if (error) {
        console.error('Error checking refresh status:', error);
        return false;
      }

      return data || false;
    },
    // Check every minute
    refetchInterval: 60 * 1000,
  });
};
