import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface ScheduleItem {
  type: 'check-in' | 'check-out';
  name: string;
  property: string;
  time: string;
  avatar: string;
  bookingId: string;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

export const TodaySchedule = () => {
  const today = new Date();
  const todayStr = format(startOfDay(today), 'yyyy-MM-dd');

  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['today-schedule', todayStr],
    queryFn: async (): Promise<ScheduleItem[]> => {
      // Fetch check-ins and check-outs for today
      const [checkInsResult, checkOutsResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, booking_number, arrival_time, customer_id, property_id, customers(full_name), properties(name)')
          .eq('check_in_date', todayStr)
          .not('status', 'eq', 'cancelled'),
        supabase
          .from('bookings')
          .select('id, booking_number, customer_id, property_id, customers(full_name), properties(name)')
          .eq('check_out_date', todayStr)
          .not('status', 'eq', 'cancelled'),
      ]);

      const items: ScheduleItem[] = [];

      if (checkInsResult.data) {
        for (const b of checkInsResult.data) {
          const customerName = (b as any).customers?.full_name || 'Unknown Guest';
          const propertyName = (b as any).properties?.name || 'Unknown Property';
          items.push({
            type: 'check-in',
            name: customerName,
            property: propertyName,
            time: b.arrival_time || '2:00 PM',
            avatar: getInitials(customerName),
            bookingId: b.id,
          });
        }
      }

      if (checkOutsResult.data) {
        for (const b of checkOutsResult.data) {
          const customerName = (b as any).customers?.full_name || 'Unknown Guest';
          const propertyName = (b as any).properties?.name || 'Unknown Property';
          items.push({
            type: 'check-out',
            name: customerName,
            property: propertyName,
            time: '12:00 PM',
            avatar: getInitials(customerName),
            bookingId: b.id,
          });
        }
      }

      return items;
    },
    refetchInterval: 60000,
  });

  const checkIns = schedule.filter(s => s.type === 'check-in');
  const checkOuts = schedule.filter(s => s.type === 'check-out');
  
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Today's Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {schedule.length} activities planned
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">{checkIns.length} Check-ins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">{checkOuts.length} Check-outs</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : schedule.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No check-ins or check-outs today.</p>
        ) : (
          schedule.map((item, index) => {
            const isCheckIn = item.type === 'check-in';
            
            return (
              <Link
                to={`/dashboard/bookings/${item.bookingId}`}
                key={index}
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
                  {item.avatar}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{item.property}</p>
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
                      {item.time}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })
        )}
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
