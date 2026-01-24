import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'staff';
export type Department = 'management' | 'reception' | 'housekeeping' | 'bar' | 'maintenance' | 'security';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department: Department;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

// Helper to map database app_role enum to frontend UserRole
const mapDbRoleToUserRole = (dbRole: string): UserRole => {
  // Database uses: 'admin', 'housekeeper', 'maintenance', 'barman', 'facility_manager'
  // Frontend expects: 'admin', 'manager', 'receptionist', 'staff'
  const roleMap: Record<string, UserRole> = {
    'admin': 'admin',
    'facility_manager': 'manager',
    'housekeeper': 'staff',
    'maintenance': 'staff',
    'barman': 'staff',
  };
  return roleMap[dbRole] || 'staff';
};

/**
 * Get current user's profile including role and department
 * Queries profiles joined with user_roles and user_departments
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

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      // Get role from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
      }

      // Get department from user_departments
      const { data: deptData, error: deptError } = await supabase
        .from('user_departments')
        .select('department, is_owner')
        .eq('user_id', user.id)
        .maybeSingle();

      if (deptError) {
        console.error('Error fetching user department:', deptError);
      }

      // If profile doesn't exist, return null to trigger profile creation
      if (!profile) {
        console.warn('No profile found for user');
        return null;
      }

      // Map the database role to frontend role
      const role = roleData?.role ? mapDbRoleToUserRole(roleData.role) : 'admin';
      const department = (deptData?.department as Department) || 'management';
      const is_owner = deptData?.is_owner || false;

      return {
        id: profile.id,
        email: profile.email || user.email || '',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role,
        department,
        is_owner,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      } as UserProfile;
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

/**
 * Check if current user is the owner
 */
export const useIsOwner = () => {
  const { data: profile } = useCurrentUser();
  return profile?.is_owner === true;
};

/**
 * Fetch all admin users for display in settings
 * Queries profiles joined with user_roles (role='admin') and user_departments
 */
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all users with admin role
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error fetching admin roles:', rolesError);
        throw new Error(`Failed to fetch admin roles: ${rolesError.message}`);
      }

      if (!adminRoles || adminRoles.length === 0) {
        return [];
      }

      const adminUserIds = adminRoles.map(r => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at, updated_at')
        .in('id', adminUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      // Get departments for these users
      const { data: departments, error: deptsError } = await supabase
        .from('user_departments')
        .select('user_id, department, is_owner')
        .in('user_id', adminUserIds);

      if (deptsError) {
        console.error('Error fetching departments:', deptsError);
      }

      // Combine the data
      const adminUsers: UserProfile[] = profiles?.map(profile => {
        const dept = departments?.find(d => d.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: 'admin' as UserRole,
          department: (dept?.department as Department) || 'management',
          is_owner: dept?.is_owner || false,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      }) || [];

      // Sort: owner first, then by created_at
      return adminUsers.sort((a, b) => {
        if (a.is_owner && !b.is_owner) return -1;
        if (!a.is_owner && b.is_owner) return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    },
  });
};

/**
 * Transfer ownership to another admin user
 */
export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOwnerId: string) => {
      const { data, error } = await supabase.rpc('transfer_ownership', {
        new_owner_id: newOwnerId
      });

      if (error) {
        console.error('Error transferring ownership:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
      toast.success('Ownership transferred successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to transfer ownership: ${error.message}`);
    },
  });
};

/**
 * Check if any owner exists in the system
 */
export const useHasOwner = () => {
  return useQuery({
    queryKey: ['has-owner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_departments')
        .select('user_id')
        .eq('is_owner', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking owner:', error);
        return false;
      }

      return !!data;
    },
  });
};

/**
 * Assign initial owner (when no owner exists)
 */
export const useAssignOwner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_departments')
        .update({ is_owner: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error assigning owner:', error);
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['has-owner'] });
      toast.success('Owner assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign owner: ${error.message}`);
    },
  });
};
