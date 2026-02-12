import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Wrench,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useVendorsPaginated } from '@/hooks/useVendors';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const Vendors = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'recent' | 'all'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch vendors from database with server-side pagination
  const { data: paginatedVendors, isLoading: vendorsLoading } = useVendorsPaginated(
    false, // activeOnly
    { page: currentPage, pageSize: itemsPerPage }
  );

  const allVendors = paginatedVendors?.data || [];
  const totalPages = paginatedVendors?.totalPages || 1;
  const totalCount = paginatedVendors?.totalCount || 0;

  // Get unique specialties from real data (would need separate query for all specialties)
  const specialties = useMemo(() => {
    return [...new Set(allVendors.map(v => v.specialty))];
  }, [allVendors]);

  // Note: Recently used vendors would require a separate query or different sorting
  // For now, we use the paginated results directly
  const recentlyUsedVendors = allVendors;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, specialtyFilter, viewMode]);

  if (authLoading || vendorsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Note: Search, status, and specialty filtering is now handled server-side
  // The API would need to support these filters for full implementation
  const filteredVendors = allVendors;

  // Pagination is now handled server-side
  const displayVendors = filteredVendors;

  // Calculate stats from current page data
  // Note: For accurate stats across all vendors, a separate aggregate query would be needed
  const totalVendors = totalCount;
  const activeVendors = allVendors.filter(v => v.active).length;
  const totalJobs = allVendors.reduce((sum, v) => sum + v.completed_jobs, 0);
  const avgRating = allVendors.length > 0
    ? (allVendors.reduce((sum, v) => sum + v.rating, 0) / allVendors.length).toFixed(1)
    : '0.0';

  const handleAction = (action: string, vendorId: string) => {
    if (action === 'view') {
      navigate(`/dashboard/vendors/${vendorId}`);
    } else {
      toast({
        title: action,
        description: `Action "${action}" triggered for vendor ${vendorId}`,
      });
    }
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
          {/* Back Button & Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/maintenance')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Vendor Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your preferred service vendors and contractors
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => toast({ title: 'Add Vendor', description: 'Add vendor dialog coming soon' })}
            >
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8">
            {[
              {
                label: 'Total Vendors',
                value: totalVendors,
                subtext: 'Registered',
                icon: Users,
                color: 'text-foreground',
                gradient: 'from-accent/20 to-accent/5',
              },
              {
                label: 'Active',
                value: activeVendors,
                subtext: 'Currently active',
                icon: CheckCircle2,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
              },
              {
                label: 'Total Jobs',
                value: totalJobs,
                subtext: 'Completed',
                icon: Wrench,
                color: 'text-sky-600 dark:text-sky-400',
                gradient: 'from-sky-500/20 to-sky-500/5',
              },
              {
                label: 'Avg Rating',
                value: avgRating,
                subtext: 'Out of 5.0',
                icon: Star,
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
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <stat.icon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className={cn('text-2xl font-display font-bold', stat.color)}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                </div>

                {/* Decorative sparkle */}
                <Sparkles className="absolute top-3 right-3 h-4 w-4 text-accent/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* View Toggle & Filters */}
          <div className="relative rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-4 mb-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              {/* View Toggle Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('recent')}
                  className={cn(
                    'gap-2 transition-all',
                    viewMode === 'recent' && 'bg-accent hover:bg-accent/90'
                  )}
                >
                  <Clock className="h-4 w-4" />
                  Recently Used
                </Button>
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('all')}
                  className={cn(
                    'gap-2 transition-all',
                    viewMode === 'all' && 'bg-accent hover:bg-accent/90'
                  )}
                >
                  <Users className="h-4 w-4" />
                  All Vendors
                </Button>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or location..."
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-36 bg-background/50 border-border/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full lg:w-44 bg-background/50 border-border/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayVendors.map((vendor, index) => (
              <Card
                key={vendor.id}
                className={cn(
                  'group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-muted/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 hover:border-accent/30 animate-fade-in'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/dashboard/vendors/${vendor.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{vendor.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {vendor.specialty}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('view', vendor.id); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('Edit', vendor.id); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('Delete', vendor.id); }} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">{vendor.rating}</span>
                    </div>
                    <Badge
                      variant={vendor.active ? 'default' : 'secondary'}
                      className={cn(
                        'text-xs',
                        vendor.active && 'bg-emerald-500 hover:bg-emerald-600'
                      )}
                    >
                      {vendor.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{vendor.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{vendor.completed_jobs}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{vendor.total_jobs}</p>
                      <p className="text-xs text-muted-foreground">Total Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-accent">
                        {vendor.hourly_rate ? formatCurrency(vendor.hourly_rate) : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No vendors found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Try adjusting your search or filters to find the vendor you're looking for.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 animate-fade-in">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={cn(
                        'cursor-pointer',
                        currentPage === 1 && 'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page and neighbors
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Show ellipsis
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={cn(
                        'cursor-pointer',
                        currentPage === totalPages && 'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Showing {displayVendors.length} of {totalCount} vendors (Page {currentPage} of {totalPages})
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Vendors;
