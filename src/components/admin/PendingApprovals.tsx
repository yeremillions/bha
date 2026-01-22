import { useNavigate } from 'react-router-dom';
import { usePendingApprovals, useApproveBooking, useRejectBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Eye, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const PendingApprovals = () => {
  const navigate = useNavigate();
  const { data: pendingBookings = [], isLoading } = usePendingApprovals();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="animate-pulse">
          <div className="h-4 w-40 bg-muted rounded mb-4"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (pendingBookings.length === 0) {
    return null; // Don't show the section if there are no pending approvals
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-amber-50/30 to-background dark:from-amber-950/30 dark:via-amber-950/20 dark:to-background p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="font-semibold text-foreground">Pending Approvals</h3>
        <Badge variant="outline" className="ml-auto border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">
          {pendingBookings.length} {pendingBookings.length === 1 ? 'booking' : 'bookings'}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        These bookings were created without payment and require manager approval before confirmation.
      </p>

      <div className="space-y-3">
        {pendingBookings.slice(0, 3).map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-border/50 bg-card p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {booking.booking_number}
                  </span>
                  <Badge variant="outline" className="text-xs border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    Pending Approval
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {booking.customer?.full_name || 'Unknown Guest'}
                </p>
                <p className="text-xs text-muted-foreground">{booking.customer?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(booking.check_in_date), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{booking.num_guests} guests</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(booking.total_amount)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 gap-1 text-xs"
                  onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 gap-1 text-xs text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => rejectBooking.mutate({ id: booking.id })}
                  disabled={rejectBooking.isPending}
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => approveBooking.mutate(booking.id)}
                  disabled={approveBooking.isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingBookings.length > 3 && (
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={() => navigate('/dashboard/bookings')}
        >
          View all {pendingBookings.length} pending approvals
        </Button>
      )}
    </div>
  );
};
