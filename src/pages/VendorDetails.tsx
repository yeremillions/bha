import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Wrench,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  FileText,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';

// Mock vendors data
const vendorsData: Record<string, {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  completedJobs: number;
  pendingJobs: number;
  phone: string;
  email: string;
  location: string;
  status: string;
  joinedDate: string;
  totalEarnings: number;
  description: string;
  responseTime: string;
  satisfactionRate: number;
}> = {
  V001: {
    id: 'V001',
    name: 'John AC Services',
    specialty: 'HVAC',
    rating: 4.8,
    completedJobs: 15,
    pendingJobs: 2,
    phone: '+234 801 234 5678',
    email: 'john@johnac.com',
    location: 'Victoria Island, Lagos',
    status: 'active',
    joinedDate: '2024-03-15',
    totalEarnings: 375000,
    description: 'Specialized in air conditioning installation, maintenance, and repair. Over 10 years of experience with commercial and residential HVAC systems.',
    responseTime: '< 2 hours',
    satisfactionRate: 96,
  },
  V002: {
    id: 'V002',
    name: 'PowerFix Solutions',
    specialty: 'Electrical',
    rating: 4.9,
    completedJobs: 22,
    pendingJobs: 3,
    phone: '+234 802 345 6789',
    email: 'info@powerfix.ng',
    location: 'Lekki Phase 1, Lagos',
    status: 'active',
    joinedDate: '2024-01-10',
    totalEarnings: 550000,
    description: 'Full-service electrical contractor specializing in residential and commercial electrical work. Licensed and insured.',
    responseTime: '< 1 hour',
    satisfactionRate: 98,
  },
  V003: {
    id: 'V003',
    name: 'AquaMaint Ltd',
    specialty: 'Pool/Facilities',
    rating: 4.7,
    completedJobs: 8,
    pendingJobs: 1,
    phone: '+234 803 456 7890',
    email: 'service@aquamaint.com',
    location: 'Ikoyi, Lagos',
    status: 'active',
    joinedDate: '2024-05-20',
    totalEarnings: 192000,
    description: 'Pool maintenance and facilities management specialists. Expert in water treatment, equipment repair, and general facility upkeep.',
    responseTime: '< 4 hours',
    satisfactionRate: 94,
  },
  V004: {
    id: 'V004',
    name: 'TilePro Services',
    specialty: 'General Repairs',
    rating: 4.6,
    completedJobs: 12,
    pendingJobs: 0,
    phone: '+234 804 567 8901',
    email: 'tilepro@gmail.com',
    location: 'Surulere, Lagos',
    status: 'inactive',
    joinedDate: '2024-02-28',
    totalEarnings: 288000,
    description: 'Expert tiling, grouting, and general repair services. Specializing in bathroom and kitchen renovations.',
    responseTime: '< 6 hours',
    satisfactionRate: 92,
  },
  V005: {
    id: 'V005',
    name: 'NetFix Tech',
    specialty: 'IT/Electrical',
    rating: 4.9,
    completedJobs: 18,
    pendingJobs: 4,
    phone: '+234 805 678 9012',
    email: 'support@netfixtech.ng',
    location: 'Victoria Island, Lagos',
    status: 'active',
    joinedDate: '2024-04-12',
    totalEarnings: 462000,
    description: 'IT solutions and smart home installations. Networking, security systems, and home automation specialists.',
    responseTime: '< 1 hour',
    satisfactionRate: 97,
  },
  V006: {
    id: 'V006',
    name: 'QuickPlumb NG',
    specialty: 'Plumbing',
    rating: 4.5,
    completedJobs: 9,
    pendingJobs: 2,
    phone: '+234 806 789 0123',
    email: 'quickplumb@outlook.com',
    location: 'Yaba, Lagos',
    status: 'active',
    joinedDate: '2024-06-01',
    totalEarnings: 180000,
    description: 'Professional plumbing services including leak repairs, pipe installations, and bathroom fixtures.',
    responseTime: '< 3 hours',
    satisfactionRate: 90,
  },
};

// Mock job history
const jobHistory = [
  {
    id: 'MT001',
    property: 'Luxury 3-Bedroom Penthouse',
    issue: 'AC not cooling properly in master bedroom',
    date: '2025-01-03',
    cost: 25000,
    status: 'in_progress',
    priority: 'urgent',
  },
  {
    id: 'MT008',
    property: 'Executive Studio',
    issue: 'AC unit servicing and filter replacement',
    date: '2024-12-28',
    cost: 18000,
    status: 'completed',
    priority: 'normal',
  },
  {
    id: 'MT012',
    property: 'Family 4-Bedroom Home',
    issue: 'New split AC installation in living room',
    date: '2024-12-15',
    cost: 85000,
    status: 'completed',
    priority: 'normal',
  },
  {
    id: 'MT015',
    property: 'Cozy 2-Bedroom Apartment',
    issue: 'AC gas refill and compressor check',
    date: '2024-12-01',
    cost: 22000,
    status: 'completed',
    priority: 'high',
  },
  {
    id: 'MT020',
    property: 'Luxury Penthouse',
    issue: 'Central AC system maintenance',
    date: '2024-11-18',
    cost: 45000,
    status: 'completed',
    priority: 'normal',
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-500 text-white',
  assigned: 'bg-sky-500 text-white',
  in_progress: 'bg-emerald-500 text-white',
  completed: 'bg-emerald-600 text-white',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const priorityStyles: Record<string, string> = {
  urgent: 'bg-rose-500 text-white border-rose-500',
  high: 'bg-amber-500 text-white border-amber-500',
  normal: 'bg-sky-500 text-white border-sky-500',
  low: 'bg-slate-500 text-white border-slate-500',
};

const VendorDetails = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const vendor = id ? vendorsData[id] : null;

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Vendor Not Found</h2>
          <p className="text-muted-foreground mb-4">The vendor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard/vendors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  const handleAction = (action: string) => {
    toast({
      title: action,
      description: `Action "${action}" triggered for ${vendor.name}`,
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
          {/* Back Button & Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/vendors')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-display font-bold text-foreground">{vendor.name}</h1>
                  <Badge
                    variant={vendor.status === 'active' ? 'default' : 'secondary'}
                    className={cn(
                      vendor.status === 'active' && 'bg-emerald-500 hover:bg-emerald-600'
                    )}
                  >
                    {vendor.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{vendor.specialty} Specialist</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => handleAction('Edit Vendor')}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => handleAction('Delete Vendor')}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Vendor Info Cards */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
            {/* Contact Information */}
            <Card className="border-border/50 animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{vendor.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{vendor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{vendor.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium text-foreground">
                      {new Date(vendor.joinedDate).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5">
                    <div className="flex items-center justify-center gap-1 text-accent mb-1">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-2xl font-bold">{vendor.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{vendor.satisfactionRate}%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-sky-500/10 to-sky-500/5">
                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{vendor.responseTime}</p>
                    <p className="text-xs text-muted-foreground">Response Time</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{vendor.completedJobs}</p>
                    <p className="text-xs text-muted-foreground">Jobs Done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-accent">{formatCurrency(vendor.totalEarnings)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-center">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{vendor.completedJobs}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-center">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{vendor.pendingJobs}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{vendor.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Job History */}
          <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Job History
              </CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Property</TableHead>
                      <TableHead className="font-semibold">Issue</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobHistory.map((job) => (
                      <TableRow
                        key={job.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/dashboard/maintenance/${job.id}`)}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {job.id}
                        </TableCell>
                        <TableCell className="font-medium">{job.property}</TableCell>
                        <TableCell className="max-w-xs truncate">{job.issue}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(job.date).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', priorityStyles[job.priority])}>
                            {job.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', statusStyles[job.status])}>
                            {statusLabels[job.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(job.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default VendorDetails;
