import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBookings, useUpdateBookingStatus, useCancelBooking, type BookingStatus } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Banknote,
  Eye,
  Edit,
  CalendarClock,
  MessageSquare,
  FileText,
  XCircle,
  Sparkles,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

const statusStyles = {
  confirmed: 'bg-emerald-500 text-white border-emerald-500',
  pending: 'bg-amber-500 text-white border-amber-500',
  checked_in: 'bg-orange-500 text-white border-orange-500',
  completed: 'bg-emerald-600 text-white border-emerald-600',
  cancelled: 'bg-rose-500 text-white border-rose-500',
};

const statusLabels = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  checked_in: 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const paymentStyles = {
  paid: 'bg-emerald-500 text-white',
  pending: 'bg-amber-500 text-white',
  refunded: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30',
};

const paymentLabels = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const Bookings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Fetch bookings from database
  const { data: allBookings = [], isLoading: bookingsLoading, error } = useBookings();
  const updateBookingStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();

  // Update search query when URL params change
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Client-side filtering
  const filteredBookings = useMemo(() => {
    return allBookings.filter(booking => {
      // Search filter
      const matchesSearch = !searchQuery ||
        booking.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.special_requests?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      // Payment filter
      const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [allBookings, searchQuery, statusFilter, paymentFilter]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return allBookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  }, [allBookings]);

  // Handle various booking actions
  const handleAction = async (action: string, bookingId: string) => {
    if (action === 'View Details') {
      navigate(`/dashboard/bookings/${bookingId}`);
      return;
    }

    if (action === 'Check In') {
      await updateBookingStatus.mutateAsync({ id: bookingId, status: 'checked_in' });
      return;
    }

    if (action === 'Confirm') {
      await updateBookingStatus.mutateAsync({ id: bookingId, status: 'confirmed' });
      return;
    }

    if (action === 'Cancel Booking') {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
        await cancelBooking.mutateAsync({ id: bookingId, refund: true });
      }
      return;
    }

    // Placeholder for other actions
    toast({
      title: action,
      description: `Action "${action}" triggered for booking ${bookingId}`,
    });
  };

  // Show loading state
  if (authLoading || bookingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-destructive">Error loading bookings: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
      </div>
      
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)} 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div
        className={cn(
          'relative transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Header */}
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Bookings</h1>
              <p className="text-muted-foreground mt-1">
                Manage all property reservations and guest stays
              </p>
            </div>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => handleAction('Export', 'all')}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
            {[
              {
                label: 'Total Bookings',
                value: allBookings.length,
                subtext: 'All time',
                icon: Calendar,
                color: 'text-foreground',
                gradient: 'from-accent/20 to-accent/5',
                filterValue: 'all',
                filterType: 'status'
              },
              {
                label: 'Confirmed',
                value: allBookings.filter(b => b.status === 'confirmed').length,
                subtext: 'Upcoming stays',
                icon: CheckCircle2,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
                filterValue: 'confirmed',
                filterType: 'status'
              },
              {
                label: 'Pending',
                value: allBookings.filter(b => b.status === 'pending').length,
                subtext: 'Awaiting confirmation',
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                gradient: 'from-amber-500/20 to-amber-500/5',
                filterValue: 'pending',
                filterType: 'status'
              },
              {
                label: 'Checked In',
                value: allBookings.filter(b => b.status === 'checked_in').length,
                subtext: 'Currently occupied',
                icon: Users,
                color: 'text-sky-600 dark:text-sky-400',
                gradient: 'from-sky-500/20 to-sky-500/5',
                filterValue: 'checked_in',
                filterType: 'status'
              },
              {
                label: 'Total Revenue',
                value: formatCurrency(totalRevenue),
                subtext: 'From paid bookings',
                icon: Banknote,
                color: 'text-accent',
                gradient: 'from-accent/20 to-accent/5',
                filterValue: 'paid',
                filterType: 'payment'
              },
            ].map((stat, index) => (
              <button
                key={stat.label}
                onClick={() => {
                  if (stat.filterType === 'status') {
                    setStatusFilter(stat.filterValue);
                    setPaymentFilter('all');
                  } else {
                    setPaymentFilter(stat.filterValue);
                    setStatusFilter('all');
                  }
                }}
                className={cn(
                  "group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 text-left cursor-pointer hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5",
                  stat.gradient,
                  (stat.filterType === 'status' && statusFilter === stat.filterValue) ||
                  (stat.filterType === 'payment' && paymentFilter === stat.filterValue)
                    ? "border-accent ring-2 ring-accent/20" 
                    : "border-border/50"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className={cn("text-2xl font-display font-bold", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                </div>
                
                {/* Decorative sparkle */}
                <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="relative rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Filters</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by guest, booking ID, or property..."
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44 bg-background/50 border-border/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-44 bg-background/50 border-border/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Payment Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">All Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">ID</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Guest</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Property</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Check-in / Out</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center whitespace-nowrap">Guests</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Amount</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <TableRow
                        key={booking.id}
                        onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                        className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-foreground">{booking.booking_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{booking.customer?.full_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{booking.customer?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{booking.property?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-muted-foreground whitespace-nowrap">
                              <span className="text-xs">In:</span>{' '}
                              <span className="text-foreground">{formatDate(booking.check_in_date)}</span>
                            </p>
                            <p className="text-muted-foreground whitespace-nowrap">
                              <span className="text-xs">Out:</span>{' '}
                              <span className="text-foreground">{formatDate(booking.check_out_date)}</span>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-foreground">{booking.num_guests}</TableCell>
                        <TableCell className="font-medium text-foreground">
                          {formatCurrency(booking.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'capitalize border-0 whitespace-nowrap',
                              statusStyles[booking.status as keyof typeof statusStyles]
                            )}
                          >
                            {statusLabels[booking.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleAction('View Details', booking.id)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleAction('Edit Booking', booking.id)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit Booking
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleAction('Reschedule', booking.id)}
                              >
                                <CalendarClock className="h-4 w-4" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {booking.status === 'confirmed' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleAction('Check In', booking.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Mark as Checked In
                                </DropdownMenuItem>
                              )}
                              {booking.status === 'pending' && (
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleAction('Confirm', booking.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Confirm Booking
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleAction('Send Message', booking.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => handleAction('Generate Invoice', booking.id)}
                              >
                                <FileText className="h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="gap-2 text-destructive focus:text-destructive"
                                onClick={() => handleAction('Cancel Booking', booking.id)}
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Calendar className="h-8 w-8 mb-2 opacity-50" />
                          <p>No bookings found</p>
                          <p className="text-sm">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-border/50 text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {allBookings.length} bookings
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bookings;
