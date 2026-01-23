import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { TeamInvitation } from './useTeamInvitations';

/**
 * Fetch invitation by token (for acceptance flow)
 */
export const useInvitationByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['invitation-by-token', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No invitation token provided');
      }

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('invite_token', token)
        .maybeSingle();

      if (error) {
        console.error('Error fetching invitation:', error);
        throw new Error(`Failed to fetch invitation: ${error.message}`);
      }

      if (!data) {
        throw new Error('Invitation not found');
      }

      return data as TeamInvitation;
    },
    enabled: !!token,
    retry: false,
  });
};

interface AcceptInvitationParams {
  token: string;
  password: string;
  fullName: string;
  invitation: TeamInvitation;
}

/**
 * Accept invitation and create user account
 */
export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, password, fullName, invitation }: AcceptInvitationParams) => {
      // Sign up with role and department in metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: invitation.role,
            department: invitation.department,
          },
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          user_id: authData.user.id,
        })
        .eq('invite_token', token);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        // Don't throw - user was created successfully
      }

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Account created successfully',
        description: 'Welcome to Brooklyn Hills Apartments! Please check your email to verify your account.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create account',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
