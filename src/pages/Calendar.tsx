import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { useProperties } from '@/hooks/useProperties';
import { cn } from '@/lib/utils';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Percent,
  BookOpen,
  Banknote,
  Home,
  Sparkles,
  User,
  ArrowRight,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Calendar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedDayBookings, setSelectedDayBookings] = useState<any[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch real data
  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: allProperties = [], isLoading: propertiesLoading } = useProperties();

  // Build properties dropdown list - MUST be before any early returns
  const properties = useMemo(() => {
    return [
      { id: 'all', name: 'All Properties' },
      ...allProperties.map(p => ({ id: p.id, name: p.name }))
    ];
  }, [allProperties]);

  // Filter bookings based on selected property - MUST be before any early returns
  const filteredBookings = useMemo(() => {
    const bookings = selectedProperty === 'all'
      ? allBookings
      : allBookings.filter(b => b.property_id === selectedProperty);

    // Only include confirmed and checked_in bookings
    return bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in');
  }, [allBookings, selectedProperty]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Early returns AFTER all hooks
  if (loading || bookingsLoading || propertiesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get booking status for a specific day
  const getDateStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    if (date < today) return 'past';

    const bookingsOnDate = filteredBookings.filter(booking => {
      const start = new Date(booking.check_in_date);
      const end = new Date(booking.check_out_date);
      const checkDate = new Date(dateStr);
      return checkDate >= start && checkDate <= end;
    });

    if (bookingsOnDate.length === 0) return 'available';
    if (selectedProperty === 'all') {
      // For all properties, check occupancy percentage
      const totalProperties = properties.length - 1; // exclude 'all'
      const occupancyRate = bookingsOnDate.length / totalProperties;
      if (occupancyRate >= 1) return 'fully-booked';
      if (occupancyRate > 0) return 'partially-booked';
    } else {
      return 'fully-booked';
    }

    return 'available';
  };

  // Get bookings for a specific day
  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredBookings.filter(booking => {
      const start = new Date(booking.check_in_date);
      const end = new Date(booking.check_out_date);
      const checkDate = new Date(dateStr);
      return checkDate >= start && checkDate <= end;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate stats
  const monthBookings = filteredBookings.filter(b => {
    const start = new Date(b.check_in_date);
    return start.getMonth() === month && start.getFullYear() === year;
  });

  const totalDays = daysInMonth * (selectedProperty === 'all' ? allProperties.length : 1);
  const bookedDays = filteredBookings.reduce((acc, booking) => {
    const start = new Date(booking.check_in_date);
    const end = new Date(booking.check_out_date);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const effectiveStart = start < monthStart ? monthStart : start;
    const effectiveEnd = end > monthEnd ? monthEnd : end;

    if (effectiveStart <= effectiveEnd) {
      const days = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return acc + days;
    }
    return acc;
  }, 0);

  const occupancyRate = totalDays > 0 ? Math.round((bookedDays / totalDays) * 100) : 0;

  // Calculate actual revenue from bookings
  const monthlyRevenue = monthBookings.reduce((acc, booking) => {
    return acc + (booking.total_amount || 0);
  }, 0);

  // Generate calendar grid
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const statusStyles = {
    'available': 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
    'partially-booked': 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
    'fully-booked': 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20',
    'past': 'bg-muted/50 border-border/30 text-muted-foreground',
  };

  const isToday = (day: number) => {
    const date = new Date(year, month, day);
    return date.toDateString() === today.toDateString();
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
              <h1 className="text-3xl font-display font-bold text-foreground">Calendar & Availability</h1>
              <p className="text-muted-foreground mt-1">
                Manage property availability and view bookings
              </p>
            </div>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-full md:w-64 bg-background/50 border-border/50 hover:bg-background transition-colors">
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { 
                label: 'Occupancy Rate', 
                value: `${occupancyRate}%`, 
                subtext: 'This month',
                icon: Percent,
                color: 'text-foreground',
                gradient: 'from-accent/20 to-accent/5',
              },
              { 
                label: 'Bookings', 
                value: monthBookings.length, 
                subtext: `${MONTHS[month]} ${year}`,
                icon: BookOpen,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
              },
              {
                label: 'Revenue',
                value: monthlyRevenue >= 1000000
                  ? `₦${(monthlyRevenue / 1000000).toFixed(1)}M`
                  : `₦${(monthlyRevenue / 1000).toFixed(0)}K`,
                subtext: 'This month',
                icon: Banknote,
                color: 'text-accent',
                gradient: 'from-amber-500/20 to-amber-500/5',
              },
              {
                label: 'Properties',
                value: selectedProperty === 'all' ? allProperties.length : 1,
                subtext: selectedProperty === 'all' ? 'All properties' : 'Selected',
                icon: Home,
                color: 'text-foreground',
                gradient: 'from-sky-500/20 to-sky-500/5',
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "group relative rounded-xl border border-border/50 bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 animate-fade-in",
                  stat.gradient
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
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
            {/* Calendar Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    {MONTHS[month]} {year}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Legend */}
                  <div className="hidden md:flex items-center gap-4 mr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
                      <span className="text-xs text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/50" />
                      <span className="text-xs text-muted-foreground">Partially Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500/50" />
                      <span className="text-xs text-muted-foreground">Fully Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-muted/50 border border-border/50" />
                      <span className="text-xs text-muted-foreground">Past Date</span>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={goToToday}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Legend */}
              <div className="flex md:hidden flex-wrap gap-3 mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/50" />
                  <span className="text-xs text-muted-foreground">Partial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500/50" />
                  <span className="text-xs text-muted-foreground">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-muted/50 border border-border/50" />
                  <span className="text-xs text-muted-foreground">Past</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4 sm:p-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const status = getDateStatus(day);
                  const bookings = getBookingsForDay(day);
                  const todayClass = isToday(day);
                  
                  return (
                    <div
                      key={day}
                      className={cn(
                        "relative aspect-square rounded-lg border transition-all duration-200 cursor-pointer group overflow-hidden",
                        statusStyles[status],
                        todayClass && "ring-2 ring-accent ring-offset-2 ring-offset-background"
                      )}
                    >
                      <div className="absolute inset-0 p-1 sm:p-2 flex flex-col">
                        <span className={cn(
                          "text-sm sm:text-base font-medium",
                          status === 'past' ? 'text-muted-foreground' : 'text-foreground',
                          todayClass && 'text-accent font-bold'
                        )}>
                          {day}
                        </span>
                        
                        {/* Booking indicators */}
                        {bookings.length > 0 && status !== 'past' && (
                          <div className="flex-1 flex flex-col justify-end gap-0.5 overflow-hidden">
                            {bookings.slice(0, 2).map((booking) => (
                              <button
                                key={booking.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/bookings/${booking.id}`);
                                }}
                                className="hidden sm:block text-[8px] truncate px-1 py-0.5 rounded bg-accent/20 text-accent hover:bg-accent/40 transition-colors text-left"
                              >
                                {booking.customer?.full_name?.split(' ')[0] || 'Guest'}
                              </button>
                            ))}
                            {bookings.length > 2 && (
                              <div className="hidden sm:block text-[8px] text-muted-foreground">
                                +{bookings.length - 2} more
                              </div>
                            )}
                            {/* Mobile indicator */}
                            <div className="sm:hidden flex gap-0.5 justify-center">
                              {bookings.slice(0, 3).map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-accent" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Hover tooltip - click to navigate or open dialog */}
                      {bookings.length > 0 && status !== 'past' && (
                        <button
                          onClick={() => {
                            if (bookings.length === 1) {
                              navigate(`/dashboard/bookings/${bookings[0]?.id}`);
                            } else {
                              setSelectedDayBookings(bookings);
                              setSelectedDayDate(new Date(year, month, day));
                              setDialogOpen(true);
                            }
                          }}
                          className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 cursor-pointer"
                        >
                          <div className="text-center">
                            <p className="text-xs font-medium text-foreground">{bookings.length} booking{bookings.length > 1 ? 's' : ''}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-full">
                              {bookings[0]?.customer?.full_name || 'Guest'}
                            </p>
                            <p className="text-[9px] text-accent mt-1">Click to view</p>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bookings Dialog for multiple bookings */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-accent" />
                  {selectedDayDate && (
                    <span>
                      Bookings for {selectedDayDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {selectedDayBookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => {
                      setDialogOpen(false);
                      navigate(`/dashboard/bookings/${booking.id}`);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-accent/30 transition-colors group text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{booking.customer?.full_name || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground truncate">{booking.property?.name || 'Property'}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
