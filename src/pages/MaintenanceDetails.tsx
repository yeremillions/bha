import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Home,
  MapPin,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Wrench,
  AlertTriangle,
  Star,
  ClipboardList,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/integrations/supabase/types';

type MaintenanceIssue = Tables<'maintenance_issues'>;

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
  open: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  assigned: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  in_progress: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  completed: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const MaintenanceDetails = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch issue from Supabase
  const { data: issue, isLoading: issueLoading } = useQuery({
    queryKey: ['maintenance_issue', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_issues')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as MaintenanceIssue | null;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || issueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
          <AdminHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <XCircle className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Issue Not Found</h2>
              <p className="text-muted-foreground">The maintenance issue you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/dashboard/maintenance')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Maintenance
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
      </div>

      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={cn('relative transition-all duration-300', sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <AdminHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/maintenance')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold font-display">{issue.title}</h1>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs font-semibold', priorityStyles[issue.priority] || priorityStyles.normal)}
                  >
                    {priorityLabels[issue.priority] || issue.priority.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs font-medium', statusStyles[issue.status] || statusStyles.open)}
                  >
                    {statusLabels[issue.status] || issue.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Reported on {format(new Date(issue.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {issue.status !== 'completed' && (
                <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 border-emerald-500/30 hover:border-emerald-500/50">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Issue Details */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-accent" />
                    Issue Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{issue.title}</h3>
                    <Badge variant="outline" className="mt-2">{issue.issue_type}</Badge>
                  </div>
                  {issue.description && (
                    <p className="text-muted-foreground">{issue.description}</p>
                  )}
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-accent" />
                    Property Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{issue.property}</p>
                      {issue.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {issue.location}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attached Images */}
              {issue.image_urls && issue.image_urls.length > 0 && (
                <Card className="border-border/50 animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-accent" />
                      Attached Photos ({issue.image_urls.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {issue.image_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-accent/50 transition-colors group"
                        >
                          <img
                            src={url}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assigned Vendor */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    Assigned Vendor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No vendor assigned yet</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Assign Vendor
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(new Date(issue.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(new Date(issue.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                  {issue.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="text-emerald-600">{format(new Date(issue.updated_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalate Issue
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Issue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintenanceDetails;
