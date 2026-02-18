import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MoreHorizontal, TrendingUp, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatNaira } from '@/hooks/useDashboardStats';
import { format } from 'date-fns';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  checked_in: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

export const RecentBookings = () => {
  const navigate = useNavigate();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['recent-bookings-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_number, check_in_date, check_out_date, total_amount, status, customers(full_name), properties(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []).map((b: any) => ({
        id: b.id,
        name: b.customers?.full_name || 'Unknown',
        property: b.properties?.name || 'Unknown',
        amount: b.total_amount,
        status: b.status || 'pending',
        avatar: getInitials(b.customers?.full_name || 'UN'),
        date: `${format(new Date(b.check_in_date), 'MMM d')}-${format(new Date(b.check_out_date), 'd')}`,
      }));
    },
    refetchInterval: 60000,
  });

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Recent Bookings</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest reservations
          </p>
        </div>
        <Link 
          to="/dashboard/bookings" 
          className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 group"
        >
          View All 
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Bookings list */}
      <div className="divide-y divide-border/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No bookings yet.</p>
        ) : (
          bookings.map((booking, index) => (
            <div
              key={booking.id}
              className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 font-display font-bold text-sm text-accent shrink-0">
                {booking.avatar}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">{booking.name}</p>
                  <Badge 
                    variant="outline" 
                    className={cn('text-[10px] px-1.5 py-0', statusStyles[booking.status] || statusStyles.pending)}
                  >
                    {booking.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">{booking.property}</p>
                  <span className="text-muted-foreground/50">•</span>
                  <p className="text-xs text-muted-foreground">{booking.date}</p>
                </div>
              </div>
              
              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-sm text-foreground">{formatNaira(booking.amount)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
