import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardBookings } from '@/hooks/useDashboardStats';
import { format } from 'date-fns';

interface TodayScheduleProps {
  checkIns: DashboardBookings[];
  checkOuts: DashboardBookings[];
}

export const TodaySchedule = ({ checkIns, checkOuts }: TodayScheduleProps) => {
  const allActivities = [
    ...checkIns.map(b => ({ ...b, type: 'check-in' })),
    ...checkOuts.map(b => ({ ...b, type: 'check-out' }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (allActivities.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden h-full">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <h3 className="text-lg font-display font-semibold text-foreground">Today's Schedule</h3>
          <Link
            to="/dashboard/calendar"
            className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 group"
          >
            View Calendar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <p>No check-ins or check-outs scheduled for today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-display font-semibold text-foreground">Today's Schedule</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">{checkIns.length} Check-ins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">{checkOuts.length} Check-out</span>
            </div>
          </div>
        </div>
        <Link
          to="/dashboard/calendar"
          className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 group"
        >
          View Calendar
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Timeline */}
      <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
        {allActivities.map((item) => {
          const isCheckIn = item.type === 'check-in';
          const initials = item.customers?.full_name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';

          return (
            <Link
              to={`/dashboard/bookings/${item.id}`}
              key={`${item.type}-${item.id}`}
              className={cn(
                'group relative flex items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:shadow-md',
                isCheckIn
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'bg-amber-500/5 hover:bg-amber-500/10'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl font-display font-bold text-sm shrink-0 transition-transform duration-300 group-hover:scale-105',
                isCheckIn
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              )}>
                {initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.customers?.full_name || 'Unknown Guest'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">{item.properties?.name || 'Unknown Property'}</p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 gap-1.5',
                      isCheckIn
                        ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {isCheckIn ? (
                      <ArrowDownToLine className="h-3 w-3" />
                    ) : (
                      <ArrowUpFromLine className="h-3 w-3" />
                    )}
                    {/* For now, just show fixed time or derive from created_at/logic if we had time fields */}
                    {isCheckIn ? '2:00 PM' : '11:00 AM'}
                  </Badge>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="border-t border-border/50 p-4">
        <Link
          to="/dashboard/calendar"
          className="text-sm text-accent hover:text-accent/80 font-medium flex items-center justify-center gap-1 group"
        >
          View Full Calendar
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};
