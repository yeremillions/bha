import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

// Mock customers data
const customersData = [
  {
    id: 'CUST001',
    name: 'Adebayo Johnson',
    email: 'adebayo.j@email.com',
    phone: '+234 803 123 4567',
    status: 'VIP',
    bookings: 5,
    totalSpent: 1850000,
    rating: 5,
    lastBooking: '2024-12-24',
  },
  {
    id: 'CUST002',
    name: 'Grace Eze',
    email: 'grace.eze@email.com',
    phone: '+234 809 456 7890',
    status: 'VIP',
    bookings: 8,
    totalSpent: 3250000,
    rating: 5,
    lastBooking: '2024-12-27',
  },
  {
    id: 'CUST003',
    name: 'Tunde Williams',
    email: 'tunde.w@email.com',
    phone: '+234 807 345 6789',
    status: 'Regular',
    bookings: 3,
    totalSpent: 680000,
    rating: 4,
    lastBooking: '2024-12-19',
  },
  {
    id: 'CUST004',
    name: 'Chioma Okafor',
    email: 'chioma.ok@email.com',
    phone: '+234 805 234 5678',
    status: 'Regular',
    bookings: 2,
    totalSpent: 560000,
    rating: 5,
    lastBooking: '2024-12-22',
  },
  {
    id: 'CUST005',
    name: 'Ibrahim Musa',
    email: 'ibrahim.m@email.com',
    phone: '+234 810 567 8901',
    status: 'New',
    bookings: 1,
    totalSpent: 450000,
    rating: 5,
    lastBooking: '2024-12-14',
  },
  {
    id: 'CUST006',
    name: 'Folake Adeyemi',
    email: 'folake.a@email.com',
    phone: '+234 811 678 9012',
    status: 'Regular',
    bookings: 4,
    totalSpent: 1120000,
    rating: 4,
    lastBooking: '2024-11-17',
  },
];

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Stats calculations
  const totalCustomers = customersData.length;
  const vipCustomers = customersData.filter(c => c.status === 'VIP').length;
  const newCustomers = customersData.filter(c => c.status === 'New').length;
  const totalBookings = customersData.reduce((sum, c) => sum + c.bookings, 0);
  const avgBookings = Math.round(totalBookings / totalCustomers);
  const totalRevenue = customersData.reduce((sum, c) => sum + c.totalSpent, 0);

  // Top 5 customers by spending
  const topCustomers = [...customersData]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VIP':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">VIP</Badge>;
      case 'New':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">New</Badge>;
      default:
        return <Badge className="bg-sky-500/20 text-sky-600 border-sky-500/30">Regular</Badge>;
    }
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

  const handleAction = (action: string, customerId: string) => {
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
                value: totalCustomers,
                subtext: 'Registered guests',
                icon: Users,
                gradient: 'from-accent/20 to-accent/5',
              },
              {
                label: 'VIP Guests',
                value: vipCustomers,
                subtext: 'Premium customers',
                icon: Crown,
                gradient: 'from-amber-500/20 to-amber-500/5',
              },
              {
                label: 'New Guests',
                value: newCustomers,
                subtext: 'First-time bookers',
                icon: UserPlus,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
              },
              {
                label: 'Avg Bookings',
                value: avgBookings,
                subtext: 'Per customer',
                icon: Calendar,
                gradient: 'from-sky-500/20 to-sky-500/5',
              },
              {
                label: 'Total Revenue',
                value: formatCurrency(totalRevenue),
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
                        <p className="font-semibold text-foreground">{customer.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {customer.bookings} bookings
                          </Badge>
                          {renderStars(customer.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      {getStatusBadge(customer.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Customers Table */}
          <Card className="border-border/50 bg-card animate-fade-in">
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
                      <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Name & Contact</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-center">Bookings</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Total Spent</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Rating</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Last Booking</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer, index) => (
                      <TableRow
                        key={customer.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {customer.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{customer.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell className="text-center font-medium">{customer.bookings}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell>{renderStars(customer.rating)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(customer.lastBooking)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => handleAction('View', customer.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('Edit', customer.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction('Delete', customer.id)}
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
                Showing {filteredCustomers.length} of {customersData.length} customers
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Customers;
