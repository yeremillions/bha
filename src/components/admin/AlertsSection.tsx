import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  type: 'warning' | 'urgent' | 'info';
  message: string;
}

const alerts: Alert[] = [
  { id: '1', type: 'warning', message: 'Low stock: Premium Whiskey - 2 bottles remaining' },
  { id: '2', type: 'urgent', message: 'Urgent: AC repair needed in Property #3' },
  { id: '3', type: 'info', message: 'Same-day turnover required for Property #1' },
];

export const AlertsSection = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-sm text-amber-700 dark:text-amber-400">{alert.message}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-sm">
              View
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
