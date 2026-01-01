import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

// Mock booking data
const bookings = [
  {
    id: 'BK001',
    guestName: 'Adebayo Johnson',
    guestEmail: 'adebayo.j@email.com',
    property: 'Luxury 3-Bedroom Penthouse',
    checkIn: '2024-12-24',
    checkOut: '2024-12-27',
    guests: 4,
    amount: 495000,
    status: 'confirmed',
    payment: 'paid',
  },
  {
    id: 'BK002',
    guestName: 'Chioma Okafor',
    guestEmail: 'chioma.ok@email.com',
    property: 'Cozy 2-Bedroom Apartment',
    checkIn: '2024-12-22',
    checkOut: '2024-12-25',
    guests: 3,
    amount: 308000,
    status: 'pending',
    payment: 'pending',
  },
  {
    id: 'BK003',
    guestName: 'Tunde Williams',
    guestEmail: 'tunde.w@email.com',
    property: 'Executive Studio Suite',
    checkIn: '2024-12-19',
    checkOut: '2024-12-21',
    guests: 2,
    amount: 242000,
    status: 'checked_in',
    payment: 'paid',
  },
  {
    id: 'BK004',
    guestName: 'Grace Eze',
    guestEmail: 'grace.eze@email.com',
    property: 'Family 4-Bedroom Home',
    checkIn: '2024-12-27',
    checkOut: '2025-01-01',
    guests: 8,
    amount: 1430000,
    status: 'confirmed',
    payment: 'paid',
  },
  {
    id: 'BK005',
    guestName: 'Ibrahim Musa',
    guestEmail: 'ibrahim.m@email.com',
    property: 'Luxury Penthouse',
    checkIn: '2024-12-14',
    checkOut: '2024-12-16',
    guests: 5,
    amount: 450000,
    status: 'completed',
    payment: 'paid',
  },
  {
    id: 'BK006',
    guestName: 'Folake Adeyemi',
    guestEmail: 'folake.a@email.com',
    property: 'Cozy 2-Bedroom',
    checkIn: '2024-12-21',
    checkOut: '2024-12-23',
    guests: 2,
    amount: 280000,
    status: 'cancelled',
    payment: 'refunded',
  },
];

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.payment === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = bookings
    .filter(b => b.payment === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const handleAction = (action: string, bookingId: string) => {
    toast({
      title: action,
      description: `Action "${action}" triggered for booking ${bookingId}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
      </div>
      
      {/* Sidebar */}
      <AdminSidebar 
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
        <AdminHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {[
              { 
                label: 'Total Bookings', 
                value: bookings.length, 
                subtext: 'All time',
                icon: Calendar,
                color: 'text-foreground',
                gradient: 'from-accent/20 to-accent/5',
                filterValue: 'all',
                filterType: 'status'
              },
              { 
                label: 'Confirmed', 
                value: bookings.filter(b => b.status === 'confirmed').length, 
                subtext: 'Upcoming stays',
                icon: CheckCircle2,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
                filterValue: 'confirmed',
                filterType: 'status'
              },
              { 
                label: 'Pending', 
                value: bookings.filter(b => b.status === 'pending').length, 
                subtext: 'Awaiting confirmation',
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                gradient: 'from-amber-500/20 to-amber-500/5',
                filterValue: 'pending',
                filterType: 'status'
              },
              { 
                label: 'Checked In', 
                value: bookings.filter(b => b.status === 'checked_in').length, 
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
            <div className="overflow-hidden">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-muted-foreground font-medium w-[8%]">ID</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[18%]">Guest</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[20%]">Property</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[18%]">Check-in / Out</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center w-[8%]">Guests</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[12%]">Amount</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[10%]">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right w-[6%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <TableRow 
                        key={booking.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-foreground">{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{booking.guestName}</p>
                            <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{booking.property}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              <span className="text-xs">In:</span>{' '}
                              <span className="text-foreground">{formatDate(booking.checkIn)}</span>
                            </p>
                            <p className="text-muted-foreground">
                              <span className="text-xs">Out:</span>{' '}
                              <span className="text-foreground">{formatDate(booking.checkOut)}</span>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-foreground">{booking.guests}</TableCell>
                        <TableCell className="font-medium text-foreground">
                          {formatCurrency(booking.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              'capitalize border-0 w-[5.5rem] justify-center whitespace-nowrap',
                              statusStyles[booking.status as keyof typeof statusStyles]
                            )}
                          >
                            {statusLabels[booking.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
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
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bookings;
