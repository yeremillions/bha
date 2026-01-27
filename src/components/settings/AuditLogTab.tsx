import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, User } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  user_email: string;
  created_at: string;
}

interface AuditLogTabProps {
  auditLogs: AuditLog[];
  loadMoreAuditLogs: () => void;
}

export const AuditLogTab = ({ auditLogs, loadMoreAuditLogs }: AuditLogTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-display">
        <History className="h-5 w-5 text-primary" />
        Audit Log
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Track all configuration changes made to your account.
      </p>

      {auditLogs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs yet. Changes will appear here once you start configuring settings.
        </div>
      ) : (
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{log.action}</p>
                    <p className="text-sm text-muted-foreground break-words">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="truncate max-w-full">{log.user_email}</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{format(new Date(log.created_at), 'PPpp')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {auditLogs.length > 0 && (
        <Button variant="outline" className="w-full" onClick={loadMoreAuditLogs}>
          Load More
        </Button>
      )}
    </CardContent>
  </Card>
);
