import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MoreHorizontal, TrendingUp, Eye, Edit, XCircle, CheckCircle, MessageSquare, Receipt, Calendar } from 'lucide-react';
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

const bookings = [
  { 
    name: 'Folake Adeyemi', 
    property: 'Luxury Penthouse', 
    amount: '₦450,000', 
    status: 'confirmed',
    avatar: 'FA',
    date: 'Dec 28-31',
  },
  { 
    name: 'Ibrahim Musa', 
    property: 'Family Home', 
    amount: '₦650,000', 
    status: 'pending',
    avatar: 'IM',
    date: 'Jan 2-8',
  },
  { 
    name: 'Grace Okonkwo', 
    property: 'Executive Studio', 
    amount: '₦220,000', 
    status: 'confirmed',
    avatar: 'GO',
    date: 'Jan 5-7',
  },
];

const statusStyles = {
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
};

export const RecentBookings = () => {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Recent Bookings</h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
            <span>from last week</span>
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
        {bookings.map((booking, index) => (
          <div
            key={index}
            className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
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
                  className={cn('text-[10px] px-1.5 py-0', statusStyles[booking.status as keyof typeof statusStyles])}
                >
                  {booking.status}
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
              <p className="font-display font-bold text-sm text-foreground">{booking.amount}</p>
            </div>
            
            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toast({ title: "View Details", description: `Viewing ${booking.name}'s booking` })}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Edit Booking", description: `Editing ${booking.name}'s booking` })}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Reschedule", description: `Rescheduling ${booking.name}'s booking` })}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {booking.status === 'confirmed' ? (
                  <DropdownMenuItem onClick={() => toast({ title: "Checked In", description: `${booking.name} marked as checked in` })}>
                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                    Mark as Checked In
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => toast({ title: "Confirmed", description: `${booking.name}'s booking confirmed` })}>
                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                    Confirm Booking
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => toast({ title: "Message Sent", description: `Opening chat with ${booking.name}` })}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast({ title: "Invoice", description: `Generating invoice for ${booking.name}` })}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Generate Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => toast({ title: "Booking Cancelled", description: `${booking.name}'s booking has been cancelled`, variant: "destructive" })}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};
