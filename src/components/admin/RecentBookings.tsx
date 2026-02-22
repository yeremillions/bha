import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
  MessageSquare,
  Receipt,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { DashboardBookings, formatNaira } from '@/hooks/useDashboardStats';
import { format } from 'date-fns';

interface RecentBookingsProps {
  bookings: DashboardBookings[];
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  completed: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  checked_in: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
};

export const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  const navigate = useNavigate();

  if (!bookings || bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden h-full">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <h3 className="text-lg font-display font-semibold text-foreground">Recent Bookings</h3>
          <Link
            to="/dashboard/bookings"
            className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 group"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <p>No recent bookings found.</p>
        </div>
      </div>
    );
  }

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
        {bookings.map((booking) => {
          const initials = booking.customers?.full_name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';

          const statusStyle = statusStyles[booking.status] || statusStyles.pending;
          const dateRange = `${format(new Date(booking.check_in_date), 'MMM d')} - ${format(new Date(booking.check_out_date), 'MMM d')}`;

          return (
            <div
              key={booking.id}
              className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
            >
              {/* Avatar */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 font-display font-bold text-sm text-accent shrink-0">
                {initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">{booking.customers?.full_name || 'Unknown Guest'}</p>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1.5 py-0', statusStyle)}
                  >
                    {booking.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">{booking.properties?.name || 'Unknown Property'}</p>
                  <span className="text-muted-foreground/50">•</span>
                  <p className="text-xs text-muted-foreground">{dateRange}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-sm text-foreground">{formatNaira(booking.total_amount)}</p>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/bookings/${booking.id}`); }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/properties/${booking.properties?.id}/edit`); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Booking
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Reschedule", description: `Rescheduling booking` }); }}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {booking.status === 'confirmed' ? (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Checked In", description: `Guest marked as checked in` }); }}>
                      <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                      Mark as Checked In
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Confirmed", description: `Booking confirmed` }); }}>
                      <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                      Confirm Booking
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Message Sent", description: `Opening chat` }); }}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Invoice", description: `Generating invoice` }); }}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => { e.stopPropagation(); toast({ title: "Booking Cancelled", description: `Booking has been cancelled`, variant: "destructive" }); }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
};
