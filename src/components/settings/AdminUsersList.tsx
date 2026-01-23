import { useAdminUsers, useIsOwner } from "@/hooks/useCurrentUser";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Crown } from "lucide-react";

export const AdminUsersList = () => {
  const { data: adminUsers, isLoading } = useAdminUsers();
  const isCurrentUserOwner = useIsOwner();

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

  return (
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
              </p>
              <p className="text-sm text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {admin.is_owner && (
              <Badge variant="default">Owner</Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {admin.department}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
