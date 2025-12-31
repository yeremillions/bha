import { AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'warning' | 'urgent' | 'info';
  title: string;
  message: string;
  time: string;
}

const alertsData: Alert[] = [
  { id: '1', type: 'warning', title: 'Low Stock', message: 'Premium Whiskey - 2 bottles remaining', time: '10 mins ago' },
  { id: '2', type: 'urgent', title: 'Urgent Repair', message: 'AC repair needed in Property #3', time: '25 mins ago' },
  { id: '3', type: 'info', title: 'Turnover Required', message: 'Same-day turnover for Property #1', time: '1 hour ago' },
];

const alertStyles = {
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50',
    icon: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    iconComponent: AlertTriangle,
  },
  urgent: {
    bg: 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50',
    icon: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    iconComponent: AlertCircle,
  },
  info: {
    bg: 'bg-sky-500/10 border-sky-500/30 hover:border-sky-500/50',
    icon: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
    iconComponent: Info,
  },
};

export const AlertsSection = () => {
  const [alerts, setAlerts] = useState(alertsData);
  
  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Active Alerts
        </h3>
        <span className="text-xs text-muted-foreground">{alerts.length} pending</span>
      </div>
      
      <div className="grid gap-3 md:grid-cols-3">
        {alerts.map((alert) => {
          const style = alertStyles[alert.type];
          const IconComponent = style.iconComponent;
          
          return (
            <div
              key={alert.id}
              className={cn(
                'group relative overflow-hidden rounded-xl border p-4 transition-all duration-300',
                style.bg
              )}
            >
              {/* Dismiss button */}
              <button
                onClick={() => dismissAlert(alert.id)}
                className="absolute right-2 top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
              
              <div className="flex items-start gap-3">
                <div className={cn('rounded-lg p-2 shrink-0', style.icon)}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
