import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Mail, Plus, RefreshCw, Ban, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AdminUsersList } from "./AdminUsersList";
import { StaffUsersList } from "./StaffUsersList";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import { useState } from "react";

interface Invitation {
  id: string;
  email: string;
  role: string;
  department: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface UserManagementTabProps {
  isAdmin: boolean;
  invitations: Invitation[];
  invitationsLoading: boolean;
  canManageInvitations: boolean;
  resendInvitation: { mutate: (id: string) => void; isPending: boolean };
  revokeInvitation: { mutate: (id: string) => void; isPending: boolean };
  deleteInvitation: { mutate: (id: string) => void; isPending: boolean };
}

export const UserManagementTab = ({
  isAdmin,
  invitations,
  invitationsLoading,
  canManageInvitations,
  resendInvitation,
  revokeInvitation,
  deleteInvitation,
}: UserManagementTabProps) => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Users className="h-5 w-5 text-primary" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdmin && (
          <>
            <div className="space-y-2">
              <Label>Admins & Managers</Label>
              <p className="text-sm text-muted-foreground">Administrative and management team members</p>
            </div>
            <AdminUsersList />

            <div className="space-y-2 pt-6 border-t border-border">
              <Label>Staff Members</Label>
              <p className="text-sm text-muted-foreground">Housekeeping, bar, maintenance, and other staff</p>
            </div>
            <StaffUsersList />
          </>
        )}

        {invitationsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : invitations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pending Invitations</Label>
              <Badge variant="outline">{invitations.length}</Badge>
            </div>
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{invitation.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Sent {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                      </span>
                      {invitation.status === 'pending' && new Date(invitation.expires_at) < new Date() && (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invitation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resendInvitation.mutate(invitation.id)}
                        disabled={resendInvitation.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => revokeInvitation.mutate(invitation.id)}
                        disabled={revokeInvitation.isPending}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deleteInvitation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete the invitation for <strong>{invitation.email}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteInvitation.mutate(invitation.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {canManageInvitations && (
          <Button variant="outline" className="gap-2" onClick={() => setInviteDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Invite Team Member
          </Button>
        )}

        {!canManageInvitations && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              Only admins and managers can invite team members.
            </p>
          </div>
        )}

        <InviteTeamMemberDialog 
          open={inviteDialogOpen} 
          onOpenChange={setInviteDialogOpen}
          isAdmin={isAdmin}
        />
      </CardContent>
    </Card>
  );
};
