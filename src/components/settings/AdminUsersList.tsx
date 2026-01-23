import { useAdminUsers, useIsOwner, useTransferOwnership, useHasOwner, useAssignOwner, useCurrentUser } from "@/hooks/useCurrentUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Crown } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

export const AdminUsersList = () => {
  const { data: adminUsers, isLoading } = useAdminUsers();
  const { data: currentUser } = useCurrentUser();
  const { data: hasOwner } = useHasOwner();
  const isCurrentUserOwner = useIsOwner();
  const transferOwnership = useTransferOwnership();
  const assignOwner = useAssignOwner();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const handleMakeOwner = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setConfirmDialogOpen(true);
  };

  const confirmMakeOwner = () => {
    if (!selectedUserId) return;

    if (hasOwner) {
      // Transfer ownership from current owner
      transferOwnership.mutate(selectedUserId);
    } else {
      // Assign initial owner
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
        No admin users found
      </div>
    );
  }

  // Can assign owner if: no owner exists, OR current user is owner
  const canAssignOwner = !hasOwner || isCurrentUserOwner;

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
                  {admin.full_name || 'Admin User'}
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
                canAssignOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMakeOwner(admin.id, admin.full_name || admin.email)}
                    disabled={transferOwnership.isPending || assignOwner.isPending}
                  >
                    Make Owner
                  </Button>
                )
              )}
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
        title={hasOwner ? "Transfer Ownership" : "Assign Owner"}
        description={
          hasOwner
            ? `Are you sure you want to transfer ownership to ${selectedUserName}? You will lose your owner privileges.`
            : `Are you sure you want to make ${selectedUserName} the owner? This gives them full administrative control.`
        }
        confirmText={hasOwner ? "Transfer Ownership" : "Assign Owner"}
        onConfirm={confirmMakeOwner}
      />
    </>
  );
};
