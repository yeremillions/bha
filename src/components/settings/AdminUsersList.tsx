import { useAdminUsers, useIsOwner, useTransferOwnership, useHasOwner, useAssignOwner, useCurrentUser, useDeleteUser } from "@/hooks/useCurrentUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Crown, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

export const AdminUsersList = () => {
  const { data: adminUsers, isLoading } = useAdminUsers();
  const { data: currentUser } = useCurrentUser();
  const { data: hasOwner } = useHasOwner();
  const isCurrentUserOwner = useIsOwner();
  const transferOwnership = useTransferOwnership();
  const assignOwner = useAssignOwner();
  const deleteUser = useDeleteUser();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [dialogAction, setDialogAction] = useState<'transfer' | 'delete'>('transfer');

  const handleMakeOwner = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setDialogAction('transfer');
    setConfirmDialogOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setDialogAction('delete');
    setConfirmDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUserId) return;

    if (dialogAction === 'delete') {
      deleteUser.mutate(selectedUserId);
    } else if (hasOwner) {
      transferOwnership.mutate(selectedUserId);
    } else {
      assignOwner.mutate(selectedUserId);
    }
    setConfirmDialogOpen(false);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!adminUsers || adminUsers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">
        No team members found
      </div>
    );
  }

  // Can assign owner if: no owner exists, OR current user is owner
  const canAssignOwner = !hasOwner || isCurrentUserOwner;
  // Can delete users if current user is admin (owners can delete non-owners)
  const canDeleteUsers = isCurrentUserOwner || currentUser?.role === 'admin';

  return (
    <>
      <div className="space-y-3">
        {adminUsers.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                {admin.is_owner ? (
                  <Crown className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {admin.full_name || 'Team Member'}
                  {admin.id === currentUser?.id && (
                    <span className="text-muted-foreground ml-2">(You)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {admin.is_owner ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Owner
                </Badge>
              ) : (
                <>
                  {canAssignOwner && admin.id !== currentUser?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMakeOwner(admin.id, admin.full_name || admin.email || 'Admin')}
                      disabled={transferOwnership.isPending || assignOwner.isPending}
                    >
                      Make Owner
                    </Button>
                  )}
                  {canDeleteUsers && admin.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(admin.id, admin.full_name || admin.email || 'Admin')}
                      disabled={deleteUser.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
              <Badge variant="outline" className="capitalize">
                {admin.role}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {admin.department}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={
          dialogAction === 'delete' 
            ? "Delete User" 
            : hasOwner 
              ? "Transfer Ownership" 
              : "Assign Owner"
        }
        description={
          dialogAction === 'delete'
            ? `Are you sure you want to permanently delete ${selectedUserName}? This will remove their account, profile, and all access. This action cannot be undone.`
            : hasOwner
              ? `Are you sure you want to transfer ownership to ${selectedUserName}? You will lose your owner privileges.`
              : `Are you sure you want to make ${selectedUserName} the owner? This gives them full administrative control.`
        }
        confirmText={
          dialogAction === 'delete' 
            ? "Delete User" 
            : hasOwner 
              ? "Transfer Ownership" 
              : "Assign Owner"
        }
        onConfirm={confirmAction}
        variant={dialogAction === 'delete' ? 'destructive' : 'default'}
      />
    </>
  );
};
