import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Search,
  Download,
  Plus,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  Banknote,
  Star,
  Sparkles,
  Users,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ReportIssueDialog } from '@/components/maintenance/ReportIssueDialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/integrations/supabase/types';

type MaintenanceIssue = Tables<'maintenance_issues'>;

const vendors = [
  { name: 'John AC Services', specialty: 'HVAC', rating: 4.8, jobs: 15 },
  { name: 'PowerFix Solutions', specialty: 'Electrical', rating: 4.9, jobs: 22 },
  { name: 'AquaMaint Ltd', specialty: 'Pool/Facilities', rating: 4.7, jobs: 8 },
  { name: 'TilePro Services', specialty: 'General Repairs', rating: 4.6, jobs: 12 },
  { name: 'NetFix Tech', specialty: 'IT/Electrical', rating: 4.9, jobs: 18 },
];

const priorityStyles: Record<string, string> = {
  urgent: 'bg-rose-500 text-white border-rose-500',
  high: 'bg-amber-500 text-white border-amber-500',
  normal: 'bg-sky-500 text-white border-sky-500',
  medium: 'bg-sky-500 text-white border-sky-500',
  low: 'bg-slate-500 text-white border-slate-500',
};

const priorityLabels: Record<string, string> = {
  urgent: 'URGENT',
  high: 'HIGH',
  normal: 'NORMAL',
  medium: 'NORMAL',
  low: 'LOW',
};

const statusStyles: Record<string, string> = {
  open: 'bg-amber-500 text-white',
  pending: 'bg-amber-500 text-white',
  assigned: 'bg-sky-500 text-white',
  in_progress: 'bg-emerald-500 text-white',
  completed: 'bg-emerald-600 text-white',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const Maintenance = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Fetch maintenance issues from Supabase
  const { data: issues = [], isLoading: issuesLoading, refetch } = useQuery({
    queryKey: ['maintenance_issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MaintenanceIssue[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || issuesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issue_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || issue.issue_type.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const categories = [...new Set(issues.map(i => i.issue_type))];

  const handleAction = (action: string, issueId: string) => {
    toast({
      title: action,
      description: `Action "${action}" triggered for issue ${issueId}`,
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
              <h1 className="text-3xl font-display font-bold text-foreground">Maintenance Tracking</h1>
              <p className="text-muted-foreground mt-1">
                Manage property maintenance issues and vendor assignments
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleAction('Export', 'all')}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setReportDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Report Issue
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
            {[
              {
                label: 'Total Issues',
                value: issues.length,
                subtext: 'All time',
                icon: Wrench,
                color: 'text-foreground',
                gradient: 'from-accent/20 to-accent/5',
                filterValue: 'all',
                filterType: 'status',
              },
              {
                label: 'Urgent',
                value: issues.filter(i => i.priority === 'urgent').length,
                subtext: 'High priority',
                icon: AlertTriangle,
                color: 'text-rose-600 dark:text-rose-400',
                gradient: 'from-rose-500/20 to-rose-500/5',
                filterValue: 'urgent',
                filterType: 'priority',
              },
              {
                label: 'Pending',
                value: issues.filter(i => i.status === 'pending' || i.status === 'open').length,
                subtext: 'Not assigned',
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                gradient: 'from-amber-500/20 to-amber-500/5',
                filterValue: 'pending',
                filterType: 'status',
              },
              {
                label: 'In Progress',
                value: issues.filter(i => i.status === 'in_progress').length,
                subtext: 'Being fixed',
                icon: Loader2,
                color: 'text-sky-600 dark:text-sky-400',
                gradient: 'from-sky-500/20 to-sky-500/5',
                filterValue: 'in_progress',
                filterType: 'status',
              },
              {
                label: 'Completed',
                value: issues.filter(i => i.status === 'completed').length,
                subtext: 'Resolved',
                icon: CheckCircle2,
                color: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/20 to-emerald-500/5',
                filterValue: 'completed',
                filterType: 'status',
              },
            ].map((stat, index) => (
              <button
                key={stat.label}
                onClick={() => {
                  if (stat.filterType === 'status') {
                    setStatusFilter(stat.filterValue);
                    setPriorityFilter('all');
                  } else {
                    setPriorityFilter(stat.filterValue);
                    setStatusFilter('all');
                  }
                  setCategoryFilter('all');
                }}
                className={cn(
                  'group relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden transition-all duration-300 text-left cursor-pointer hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5',
                  stat.gradient,
                  (stat.filterType === 'status' && statusFilter === stat.filterValue) ||
                    (stat.filterType === 'priority' && priorityFilter === stat.filterValue)
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'border-border/50'
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
              </button>
            ))}
          </div>

          {/* Preferred Vendors Section */}
          <Card className="mb-8 border-border/50 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg font-display">Preferred Vendors</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-accent hover:text-accent/80"
                onClick={() => navigate('/dashboard/vendors')}
              >
                Manage Vendors
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {vendors.map((vendor, index) => (
                  <div
                    key={vendor.name}
                    className="group relative rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-4 text-center transition-all duration-300 hover:shadow-md hover:border-accent/30 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                      // Map vendor name to ID for navigation
                      const vendorIdMap: Record<string, string> = {
                        'John AC Services': 'V001',
                        'PowerFix Solutions': 'V002',
                        'AquaMaint Ltd': 'V003',
                        'TilePro Services': 'V004',
                        'NetFix Tech': 'V005',
                      };
                      const vendorId = vendorIdMap[vendor.name];
                      if (vendorId) {
                        navigate(`/dashboard/vendors/${vendorId}`);
                      }
                    }}
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{vendor.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{vendor.specialty}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-accent">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-semibold">{vendor.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{vendor.jobs} jobs</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="relative rounded-2xl border border-border/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Maintenance Issues</h3>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by property, issue, or ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-36 bg-background/50 border-border/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-40 bg-background/50 border-border/50 hover:bg-background transition-colors">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Maintenance Table */}
          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">ID</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Property</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap min-w-[200px]">Issue</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Priority</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Assigned To</TableHead>
                    <TableHead className="text-muted-foreground font-medium whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue, index) => (
                      <TableRow
                        key={issue.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => navigate(`/dashboard/maintenance/${issue.id}`)}
                      >
                        <TableCell className="font-medium text-foreground">{issue.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-xs">🏠</span>
                            </div>
                            <span className="text-foreground">{issue.property}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{issue.title}</p>
                            <p className="text-xs text-muted-foreground">{issue.issue_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-xs font-semibold border',
                              priorityStyles[issue.priority] || priorityStyles.normal
                            )}
                          >
                            {priorityLabels[issue.priority] || issue.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-rose-500 dark:text-rose-400 font-medium">Unassigned</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-xs font-medium',
                              statusStyles[issue.status] || statusStyles.open
                            )}
                          >
                            {statusLabels[issue.status] || issue.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Wrench className="h-8 w-8 mb-2 opacity-50" />
                          <p>No maintenance issues found</p>
                          <p className="text-sm">Try adjusting your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>

        {/* Report Issue Dialog */}
        <ReportIssueDialog 
          open={reportDialogOpen} 
          onOpenChange={setReportDialogOpen} 
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
};

export default Maintenance;
