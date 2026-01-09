import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers, useDeleteCustomer, useToggleVIPStatus } from '@/hooks/useCustomers';
import { cn } from '@/lib/utils';
import {
  Search,
  Users,
  Star,
  TrendingUp,
  DollarSign,
  Crown,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Sparkles,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Customers = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers from database
  const { data: allCustomers = [], isLoading: customersLoading, error } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const toggleVIPStatus = useToggleVIPStatus();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Client-side filtering
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(customer => {
      const matchesSearch = !searchQuery ||
        customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [allCustomers, searchQuery]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalCustomers = allCustomers.length;
    const vipCustomers = allCustomers.filter(c => c.vip_status).length;
    const newCustomers = allCustomers.filter(c => c.total_bookings <= 1).length;
    const totalBookings = allCustomers.reduce((sum, c) => sum + (c.total_bookings || 0), 0);
    const avgBookings = totalCustomers > 0 ? Math.round(totalBookings / totalCustomers) : 0;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

    return {
      totalCustomers,
      vipCustomers,
      newCustomers,
      avgBookings,
      totalRevenue,
    };
  }, [allCustomers]);

  // Top 5 customers by spending
  const topCustomers = useMemo(() => {
    return [...allCustomers]
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 5);
  }, [allCustomers]);

  // Show loading state
  if (authLoading || customersLoading) {
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
        <div className="text-destructive">Error loading customers: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (vipStatus: boolean, bookingCount: number) => {
    if (vipStatus) {
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">VIP</Badge>;
    }
    if (bookingCount <= 1) {
      return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">New</Badge>;
    }
    return <Badge className="bg-sky-500/20 text-sky-600 border-sky-500/30">Regular</Badge>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  const handleAction = async (action: string, customerId: string, customerName: string, isVIP: boolean) => {
    if (action === 'View') {
      navigate(`/dashboard/customers/${customerId}`);
      return;
    }

    if (action === 'Edit') {
      toast({
        title: 'Edit Customer',
        description: `Editing functionality coming soon for ${customerName}`,
      });
      return;
    }

    if (action === 'Toggle VIP') {
      await toggleVIPStatus.mutateAsync({ id: customerId, vipStatus: !isVIP });
      return;
    }

    if (action === 'Delete') {
      if (window.confirm(`Are you sure you want to delete ${customerName}? This cannot be undone.`)) {
        await deleteCustomer.mutateAsync(customerId);
      }
      return;
    }

    toast({
      title: action,
      description: `Action "${action}" triggered for customer ${customerId}`,
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
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Customer Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage guest profiles, booking history, and customer relationships
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            {[
              {
                label: 'Total Customers',
                value: stats.totalCustomers,
                subtext: 'Registered guests',
                icon: Users,
                gradient: 'from-accent/20 to-accent/5',
              },
              {
                label: 'VIP Guests',
                value: stats.vipCustomers,
                subtext: 'Premium customers',
                icon: Crown,
                gradient: 'from-amber-500/20 to-amber-500/5',
              },
              {
                label: 'New Guests',
                value: stats.newCustomers,
                subtext: 'First-time bookers',
                icon: UserPlus,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
              },
              {
                label: 'Avg Bookings',
                value: stats.avgBookings,
                subtext: 'Per customer',
                icon: Calendar,
                gradient: 'from-sky-500/20 to-sky-500/5',
              },
              {
                label: 'Total Revenue',
                value: formatCurrency(stats.totalRevenue),
                subtext: 'All customers',
                icon: DollarSign,
                color: 'text-amber-600 dark:text-amber-400',
                gradient: 'from-amber-500/20 to-amber-500/5',
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  'group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300',
                  stat.gradient,
                  'border-border/50 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className={cn('text-2xl font-display font-bold', stat.color || 'text-foreground')}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                </div>
                <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Top Customers by Spending */}
          <Card className="border-border/50 bg-card mb-8 animate-fade-in">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                Top Customers by Spending
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {topCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm',
                          index === 0 && 'bg-amber-500/20 text-amber-600',
                          index === 1 && 'bg-slate-400/20 text-slate-600',
                          index === 2 && 'bg-orange-500/20 text-orange-600',
                          index > 2 && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{customer.full_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customer.total_bookings || 0} bookings
                          </Badge>
                          {renderStars(Math.round(customer.average_rating || 0))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(customer.total_spent || 0)}
                      </p>
                      {getStatusBadge(customer.vip_status, customer.total_bookings || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Customers - Mobile Card View */}
          <div className="md:hidden space-y-4 animate-fade-in">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">All Customers</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 bg-background/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredCustomers.map((customer, index) => (
              <div
                key={customer.id}
                onClick={() => handleAction('View', customer.id, customer.full_name, customer.vip_status)}
                className="relative rounded-2xl border border-border/50 bg-card p-4 cursor-pointer hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header with Name and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{customer.full_name}</p>
                    {getStatusBadge(customer.vip_status, customer.total_bookings || 0)}
                  </div>
                  <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => handleAction('View', customer.id, customer.full_name, customer.vip_status)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Edit', customer.id, customer.full_name, customer.vip_status)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Toggle VIP', customer.id, customer.full_name, customer.vip_status)}>
                          <Crown className="h-4 w-4 mr-2" />
                          {customer.vip_status ? 'Remove VIP Status' : 'Make VIP'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction('Delete', customer.id, customer.full_name, customer.vip_status)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-3 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Bookings</p>
                    <p className="text-lg font-bold text-foreground">{customer.total_bookings || 0}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(customer.total_spent || 0)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <div className="flex justify-center">
                      {renderStars(Math.round(customer.average_rating || 0))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-4 text-sm text-muted-foreground text-center">
              Showing {filteredCustomers.length} of {allCustomers.length} customers
            </div>
          </div>

          {/* All Customers - Desktop Table View */}
          <Card className="hidden md:block border-border/50 bg-card animate-fade-in">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>All Customers</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-10 bg-background/50 border-border/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="text-muted-foreground font-medium w-[280px]">Name & Contact</TableHead>
                      <TableHead className="text-muted-foreground font-medium w-[120px]">Status</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-center w-[100px]">Bookings</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right w-[140px]">Total Spent</TableHead>
                      <TableHead className="text-muted-foreground font-medium w-[120px]">Rating</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer, index) => (
                      <TableRow
                        key={customer.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                        onClick={() => handleAction('View', customer.id, customer.full_name, customer.vip_status)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{customer.full_name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.vip_status, customer.total_bookings || 0)}</TableCell>
                        <TableCell className="text-center font-medium">{customer.total_bookings || 0}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(customer.total_spent || 0)}
                        </TableCell>
                        <TableCell>{renderStars(Math.round(customer.average_rating || 0))}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => handleAction('View', customer.id, customer.full_name, customer.vip_status)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('Edit', customer.id, customer.full_name, customer.vip_status)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('Toggle VIP', customer.id, customer.full_name, customer.vip_status)}>
                                <Crown className="h-4 w-4 mr-2" />
                                {customer.vip_status ? 'Remove VIP Status' : 'Make VIP'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction('Delete', customer.id, customer.full_name, customer.vip_status)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-border/50 text-center text-sm text-muted-foreground">
                Showing {filteredCustomers.length} of {allCustomers.length} customers
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Customers;
