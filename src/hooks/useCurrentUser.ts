import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'staff';
export type Department = 'management' | 'reception' | 'housekeeping' | 'bar' | 'maintenance' | 'security';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department: Department;
  created_at: string;
  updated_at: string;
}

/**
 * Get current user's profile including role and department
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

      // Get user profile with role and department
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      // If no profile exists, return a default admin profile for the first user
      if (!data) {
        console.warn('No user profile found, creating default admin profile');
        
        // Create a profile for this user
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            role: 'admin',
            department: 'management',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw new Error(`Failed to create user profile: ${createError.message}`);
        }

        return newProfile as UserProfile;
      }

      return data as UserProfile;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Module access control based on department
 * Maps departments to modules they can access
 */
const MODULE_ACCESS: Record<string, Department[] | 'all'> = {
  dashboard: 'all', // Everyone sees a dashboard
  bookings: ['management', 'reception'],
  properties: ['management', 'reception', 'maintenance'],
  customers: ['management', 'reception'],
  housekeeping: ['management', 'housekeeping'],
  bar: ['management', 'bar'],
  maintenance: ['management', 'maintenance'],
  staff: ['management'],
  inventory: ['management', 'housekeeping'],
  calendar: ['management', 'reception', 'housekeeping'],
  reports: ['management'],
  settings: ['management'], // Further restricted by role
};

/**
 * Check if current user can access a specific module
 */
export const useCanAccessModule = (module: string) => {
  const { data: profile } = useCurrentUser();

  if (!profile) return false;

  // Admin can access everything
  if (profile.role === 'admin') return true;

  const allowedDepartments = MODULE_ACCESS[module];

  // Module allows all departments
  if (allowedDepartments === 'all') return true;

  // Check if user's department is in allowed list
  if (Array.isArray(allowedDepartments)) {
    return allowedDepartments.includes(profile.department);
  }

  return false;
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
 * Only admins and managers can invite team members
 */
export const useCanManageInvitations = () => {
  const { data: profile } = useCurrentUser();
  return profile?.role === 'admin' || profile?.role === 'manager';
};

/**
 * Check if current user can approve bookings
 */
export const useCanApproveBookings = () => {
  const { data: profile } = useCurrentUser();
  return profile?.role === 'admin' || profile?.role === 'manager';
};

/**
 * Get user's accessible modules
 * Returns list of modules user can see in sidebar
 */
export const useAccessibleModules = () => {
  const { data: profile } = useCurrentUser();

  if (!profile) return [];

  const accessibleModules = Object.keys(MODULE_ACCESS).filter(module => {
    // Admin can access everything
    if (profile.role === 'admin') return true;

    const allowedDepartments = MODULE_ACCESS[module];

    // Module allows all departments
    if (allowedDepartments === 'all') return true;

    // Check if user's department is allowed
    if (Array.isArray(allowedDepartments)) {
      return allowedDepartments.includes(profile.department);
    }

    return false;
  });

  return accessibleModules;
};
