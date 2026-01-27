import { useStaffUsers, useIsOwner, useCurrentUser, useDeleteUser } from "@/hooks/useCurrentUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

export const StaffUsersList = () => {
  const { data: staffUsers, isLoading } = useStaffUsers();
  const { data: currentUser } = useCurrentUser();
  const isCurrentUserOwner = useIsOwner();
  const deleteUser = useDeleteUser();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const handleDeleteUser = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedUserId) return;
    deleteUser.mutate(selectedUserId);
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

  if (!staffUsers || staffUsers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">
        No staff members found
      </div>
    );
  }

  // Can delete users if current user is owner or admin
  const canDeleteUsers = isCurrentUserOwner || currentUser?.role === 'admin';

  return (
    <>
      <div className="space-y-3">
        {staffUsers.map((staff) => (
          <div
            key={staff.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {staff.full_name || 'Staff Member'}
                  {staff.id === currentUser?.id && (
                    <span className="text-muted-foreground ml-2">(You)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{staff.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canDeleteUsers && staff.id !== currentUser?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(staff.id, staff.full_name || staff.email || 'Staff')}
                  disabled={deleteUser.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Badge variant="outline" className="capitalize">
                {staff.role}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {staff.department}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Staff Member"
        description={`Are you sure you want to permanently delete ${selectedUserName}? This will remove their account, profile, and all access. This action cannot be undone.`}
        confirmText="Delete User"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  );
};
