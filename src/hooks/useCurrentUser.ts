import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'receptionist' | 'staff';
  created_at: string;
  updated_at: string;
}

/**
 * Get current user's profile including role
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Get user profile with role
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return data as UserProfile;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Check if current user has admin role
 */
export const useIsAdmin = () => {
  const { data: profile } = useCurrentUser();
  return profile?.role === 'admin';
};

/**
 * Check if current user has manager role or higher
 */
export const useIsManager = () => {
  const { data: profile } = useCurrentUser();
  return profile?.role === 'admin' || profile?.role === 'manager';
};

/**
 * Check if current user can manage team invitations
 */
export const useCanManageInvitations = () => {
  const { data: profile } = useCurrentUser();
  return profile?.role === 'admin' || profile?.role === 'manager';
};
