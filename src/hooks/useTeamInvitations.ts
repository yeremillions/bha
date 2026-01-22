import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type InvitationRole = 'admin' | 'manager' | 'receptionist' | 'staff';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TeamInvitation {
  id: string;
  email: string;
  role: InvitationRole;
  invited_by: string | null;
  status: InvitationStatus;
  invite_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  user_id: string | null;
}

export interface NewInvitation {
  email: string;
  role: InvitationRole;
}

/**
 * Fetch all team invitations
 */
export const useTeamInvitations = () => {
  return useQuery({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team invitations:', error);
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return data as TeamInvitation[];
    },
  });
};

/**
 * Fetch pending invitations only
 */
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ['team-invitations', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending invitations:', error);
        throw new Error(`Failed to fetch pending invitations: ${error.message}`);
      }

      return data as TeamInvitation[];
    },
  });
};

/**
 * Send a team invitation
 */
export const useSendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitation: NewInvitation) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to send invitations');
      }

      // Check if email already has pending invitation
      const { data: existing } = await supabase
        .from('team_invitations')
        .select('id, status')
        .eq('email', invitation.email)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        throw new Error('This email already has a pending invitation');
      }

      // Check if user already exists in user_profiles
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('email', invitation.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // Create invitation
      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          email: invitation.email,
          role: invitation.role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      // TODO: Send invitation email
      // This would call an edge function to send the email
      // await sendInvitationEmail(data);

      return data as TeamInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${data.email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Resend an invitation
 */
export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      // Update expires_at to 7 days from now
      const { data, error } = await supabase
        .from('team_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        console.error('Error resending invitation:', error);
        throw new Error(`Failed to resend invitation: ${error.message}`);
      }

      // TODO: Resend invitation email
      // await sendInvitationEmail(data);

      return data as TeamInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Invitation resent',
        description: `Invitation resent to ${data.email}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resend invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Revoke an invitation
 */
export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        console.error('Error revoking invitation:', error);
        throw new Error(`Failed to revoke invitation: ${error.message}`);
      }

      return data as TeamInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Invitation revoked',
        description: `Invitation to ${data.email} has been revoked`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to revoke invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Delete an invitation
 */
export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Error deleting invitation:', error);
        throw new Error(`Failed to delete invitation: ${error.message}`);
      }

      return invitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      toast({
        title: 'Invitation deleted',
        description: 'The invitation has been permanently deleted',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete invitation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
