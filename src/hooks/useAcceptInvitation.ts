import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type { TeamInvitation } from './useTeamInvitations';

/**
 * Fetch invitation by token via edge function (secure - bypasses RLS)
 * This prevents token enumeration attacks by not exposing the table directly
 */
export const useInvitationByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['invitation-by-token', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No invitation token provided');
      }

      // Call edge function to validate token securely
      const response = await fetch(
        `https://nnrzsvtaeulxunxnbxtw.supabase.co/functions/v1/validate-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate invitation');
      }

      if (!data.valid || !data.invitation) {
        throw new Error('Invitation not found');
      }

      // Map the response to match TeamInvitation interface
      return {
        ...data.invitation,
        invite_token: token, // Keep token for accept flow
      } as TeamInvitation;
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
 * Accept invitation and create user account via edge function
 * The edge function uses admin API to auto-confirm email
 */
export const useAcceptInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, password, fullName }: AcceptInvitationParams) => {
      // Call edge function to create user with auto-confirmed email
      const response = await fetch(
        `https://nnrzsvtaeulxunxnbxtw.supabase.co/functions/v1/accept-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password,
            fullName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Account created successfully!',
        description: 'Welcome to Brooklyn Hills Apartments! You can now sign in.',
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
