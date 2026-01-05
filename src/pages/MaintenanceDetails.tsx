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
  Calendar,
  User,
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Wrench,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Star,
  Banknote,
  ClipboardList,
  History,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock maintenance data with extended details
const maintenanceIssues = [
  {
    id: 'MT001',
    property: 'Luxury 3-Bedroom Penthouse',
    propertyAddress: '15 Eko Atlantic, Victoria Island, Lagos',
    issue: 'AC not cooling properly in master bedroom',
    description: 'The air conditioning unit in the master bedroom is running but not producing cold air. Guest reported that the room temperature remains warm even after running the AC for several hours.',
    reportedBy: 'Adebayo Johnson',
    reporterRole: 'Guest',
    reporterEmail: 'adebayo.j@email.com',
    reporterPhone: '+234 801 234 5678',
    category: 'HVAC',
    priority: 'urgent',
    assignedTo: 'John AC Services',
    vendorPhone: '+234 802 111 2222',
    vendorEmail: 'info@johnac.com',
    estimatedCost: 25000,
    actualCost: 22000,
    status: 'in_progress',
    createdAt: new Date(2024, 11, 18, 14, 30),
    updatedAt: new Date(2024, 11, 20, 9, 15),
    history: [
      { date: new Date(2024, 11, 18, 14, 30), action: 'Issue reported', user: 'Adebayo Johnson', note: 'Guest reported AC not cooling' },
      { date: new Date(2024, 11, 18, 15, 45), action: 'Assigned to vendor', user: 'System Admin', note: 'Assigned to John AC Services' },
      { date: new Date(2024, 11, 19, 10, 0), action: 'Vendor acknowledged', user: 'John AC Services', note: 'Will inspect tomorrow morning' },
      { date: new Date(2024, 11, 20, 9, 15), action: 'Work started', user: 'John AC Services', note: 'Technician on-site, found refrigerant leak' },
    ],
    vendorNotes: [
      { date: new Date(2024, 11, 20, 9, 30), note: 'Initial inspection reveals refrigerant leak in the outdoor unit. Need to order replacement parts.', author: 'John - Lead Technician' },
      { date: new Date(2024, 11, 20, 11, 0), note: 'Parts ordered, expected delivery by tomorrow. Will complete repair upon arrival.', author: 'John - Lead Technician' },
    ],
    costBreakdown: [
      { item: 'Labor (2 hours)', amount: 8000 },
      { item: 'Refrigerant refill', amount: 6000 },
      { item: 'Replacement valve', amount: 5000 },
      { item: 'Service call fee', amount: 3000 },
    ],
  },
  {
    id: 'MT002',
    property: 'Cozy 2-Bedroom Apartment',
    propertyAddress: '45 Palm Gardens, Lekki, Lagos',
    issue: 'Leaking kitchen faucet',
    description: 'The kitchen faucet has been dripping continuously. Water is pooling under the sink cabinet.',
    reportedBy: 'Mary Obi',
    reporterRole: 'Housekeeping',
    reporterEmail: 'mary.obi@company.com',
    reporterPhone: '+234 803 222 3333',
    category: 'Plumbing',
    priority: 'high',
    assignedTo: null,
    vendorPhone: null,
    vendorEmail: null,
    estimatedCost: 8000,
    actualCost: null,
    status: 'pending',
    createdAt: new Date(2024, 11, 19, 8, 0),
    updatedAt: new Date(2024, 11, 19, 8, 0),
    history: [
      { date: new Date(2024, 11, 19, 8, 0), action: 'Issue reported', user: 'Mary Obi', note: 'Discovered during morning cleaning routine' },
    ],
    vendorNotes: [],
    costBreakdown: [],
  },
  {
    id: 'MT003',
    property: 'Executive Studio',
    propertyAddress: '78 Victoria Island, Lagos',
    issue: 'Broken door lock on main entrance',
    description: 'The main entrance door lock is not functioning. Key gets stuck and door cannot be properly secured.',
    reportedBy: 'Night Security',
    reporterRole: 'Security',
    reporterEmail: 'security@company.com',
    reporterPhone: '+234 804 333 4444',
    category: 'Security',
    priority: 'urgent',
    assignedTo: null,
    vendorPhone: null,
    vendorEmail: null,
    estimatedCost: 15000,
    actualCost: null,
    status: 'pending',
    createdAt: new Date(2024, 11, 20, 2, 30),
    updatedAt: new Date(2024, 11, 20, 2, 30),
    history: [
      { date: new Date(2024, 11, 20, 2, 30), action: 'Issue reported', user: 'Night Security', note: 'URGENT: Main door cannot be locked properly' },
    ],
    vendorNotes: [],
    costBreakdown: [],
  },
  {
    id: 'MT004',
    property: 'Family 4-Bedroom Home',
    propertyAddress: '123 Banana Island, Ikoyi, Lagos',
    issue: 'Generator not starting',
    description: 'The backup generator fails to start automatically during power outages. Manual start also unsuccessful.',
    reportedBy: 'Property Manager',
    reporterRole: 'Property Manager',
    reporterEmail: 'pm@company.com',
    reporterPhone: '+234 805 444 5555',
    category: 'Electrical',
    priority: 'high',
    assignedTo: 'PowerFix Solutions',
    vendorPhone: '+234 806 555 6666',
    vendorEmail: 'support@powerfix.ng',
    estimatedCost: 35000,
    actualCost: null,
    status: 'assigned',
    createdAt: new Date(2024, 11, 17, 16, 0),
    updatedAt: new Date(2024, 11, 19, 10, 30),
    history: [
      { date: new Date(2024, 11, 17, 16, 0), action: 'Issue reported', user: 'Property Manager', note: 'Generator failed during power outage' },
      { date: new Date(2024, 11, 18, 9, 0), action: 'Priority escalated', user: 'System Admin', note: 'Escalated to high priority' },
      { date: new Date(2024, 11, 19, 10, 30), action: 'Assigned to vendor', user: 'System Admin', note: 'Assigned to PowerFix Solutions' },
    ],
    vendorNotes: [
      { date: new Date(2024, 11, 19, 14, 0), note: 'Scheduled inspection for tomorrow morning. Will bring diagnostic equipment.', author: 'PowerFix Support' },
    ],
    costBreakdown: [
      { item: 'Diagnostic service', amount: 10000 },
      { item: 'Estimated parts (battery/starter)', amount: 20000 },
      { item: 'Labor', amount: 5000 },
    ],
  },
  {
    id: 'MT005',
    property: 'Luxury Penthouse',
    propertyAddress: '10 Eko Atlantic, Victoria Island, Lagos',
    issue: 'Pool pump making unusual noise',
    description: 'The pool pump is producing a grinding noise when running. Water circulation seems affected.',
    reportedBy: 'Maintenance Staff',
    reporterRole: 'Maintenance',
    reporterEmail: 'maintenance@company.com',
    reporterPhone: '+234 807 666 7777',
    category: 'Facilities',
    priority: 'normal',
    assignedTo: 'AquaMaint Ltd',
    vendorPhone: '+234 808 777 8888',
    vendorEmail: 'service@aquamaint.ng',
    estimatedCost: 12000,
    actualCost: 11500,
    status: 'in_progress',
    createdAt: new Date(2024, 11, 15, 11, 0),
    updatedAt: new Date(2024, 11, 19, 15, 0),
    history: [
      { date: new Date(2024, 11, 15, 11, 0), action: 'Issue reported', user: 'Maintenance Staff', note: 'Unusual noise from pool pump during routine check' },
      { date: new Date(2024, 11, 16, 9, 0), action: 'Assigned to vendor', user: 'Facility Manager', note: 'Assigned to AquaMaint Ltd' },
      { date: new Date(2024, 11, 18, 10, 0), action: 'Work started', user: 'AquaMaint Ltd', note: 'Technician inspecting pump motor' },
      { date: new Date(2024, 11, 19, 15, 0), action: 'Parts ordered', user: 'AquaMaint Ltd', note: 'Motor bearing replacement required' },
    ],
    vendorNotes: [
      { date: new Date(2024, 11, 18, 11, 30), note: 'Pump motor bearing showing significant wear. Recommend full replacement of bearing assembly.', author: 'AquaMaint Technician' },
      { date: new Date(2024, 11, 19, 15, 0), note: 'Bearing ordered from supplier. Expected delivery in 2 days. Pool can remain operational with reduced pump hours.', author: 'AquaMaint Manager' },
    ],
    costBreakdown: [
      { item: 'Inspection fee', amount: 3000 },
      { item: 'Bearing assembly', amount: 5500 },
      { item: 'Labor (installation)', amount: 3000 },
    ],
  },
  {
    id: 'MT006',
    property: 'Executive Studio',
    propertyAddress: '78 Victoria Island, Lagos',
    issue: 'WiFi router replacement',
    description: 'Current router is outdated and not providing adequate coverage. Guest complaints about slow internet.',
    reportedBy: 'IT Support',
    reporterRole: 'IT Support',
    reporterEmail: 'it@company.com',
    reporterPhone: '+234 809 888 9999',
    category: 'IT/Electrical',
    priority: 'normal',
    assignedTo: 'NetFix Tech',
    vendorPhone: '+234 810 999 0000',
    vendorEmail: 'support@netfix.ng',
    estimatedCost: 16500,
    actualCost: 16500,
    status: 'completed',
    createdAt: new Date(2024, 11, 10, 14, 0),
    updatedAt: new Date(2024, 11, 14, 16, 30),
    history: [
      { date: new Date(2024, 11, 10, 14, 0), action: 'Issue reported', user: 'IT Support', note: 'Multiple guest complaints about WiFi speed' },
      { date: new Date(2024, 11, 11, 9, 0), action: 'Assigned to vendor', user: 'IT Manager', note: 'Assigned to NetFix Tech for router upgrade' },
      { date: new Date(2024, 11, 12, 10, 0), action: 'Work started', user: 'NetFix Tech', note: 'Installing new mesh WiFi system' },
      { date: new Date(2024, 11, 14, 16, 30), action: 'Completed', user: 'NetFix Tech', note: 'New router installed and tested. Speed improved by 300%' },
    ],
    vendorNotes: [
      { date: new Date(2024, 11, 12, 12, 0), note: 'Installed new mesh WiFi system with 3 access points for full coverage.', author: 'NetFix Technician' },
      { date: new Date(2024, 11, 14, 16, 30), note: 'System fully operational. Speed test shows 200+ Mbps throughout the property.', author: 'NetFix Technician' },
    ],
    costBreakdown: [
      { item: 'Mesh WiFi Router System', amount: 12000 },
      { item: 'Installation & Configuration', amount: 3000 },
      { item: 'Cable management', amount: 1500 },
    ],
  },
  {
    id: 'MT007',
    property: 'Cozy 2-Bedroom Apartment',
    propertyAddress: '45 Palm Gardens, Lekki, Lagos',
    issue: 'Bathroom tiles need regrouting',
    description: 'Grout between bathroom tiles is deteriorating. Some areas showing mold growth.',
    reportedBy: 'Grace Ada',
    reporterRole: 'Housekeeping',
    reporterEmail: 'grace.ada@company.com',
    reporterPhone: '+234 811 000 1111',
    category: 'General Repairs',
    priority: 'low',
    assignedTo: null,
    vendorPhone: null,
    vendorEmail: null,
    estimatedCost: 18000,
    actualCost: null,
    status: 'pending',
    createdAt: new Date(2024, 11, 20, 7, 30),
    updatedAt: new Date(2024, 11, 20, 7, 30),
    history: [
      { date: new Date(2024, 11, 20, 7, 30), action: 'Issue reported', user: 'Grace Ada', note: 'Noticed during deep cleaning. Recommend scheduling during next vacancy.' },
    ],
    vendorNotes: [],
    costBreakdown: [],
  },
];

const priorityStyles = {
  urgent: 'bg-rose-500 text-white border-rose-500',
  high: 'bg-amber-500 text-white border-amber-500',
  normal: 'bg-sky-500 text-white border-sky-500',
  low: 'bg-slate-500 text-white border-slate-500',
};

const priorityLabels = {
  urgent: 'URGENT',
  high: 'HIGH',
  normal: 'NORMAL',
  low: 'LOW',
};

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  assigned: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  in_progress: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  completed: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
};

const statusLabels = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const MaintenanceDetails = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const issue = maintenanceIssues.find((i) => i.id === id);

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

  const totalCost = issue.costBreakdown.reduce((sum, item) => sum + item.amount, 0);

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
                  <h1 className="text-2xl font-bold font-display">{issue.id}</h1>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs font-semibold', priorityStyles[issue.priority as keyof typeof priorityStyles])}
                  >
                    {priorityLabels[issue.priority as keyof typeof priorityLabels]}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs font-medium', statusStyles[issue.status as keyof typeof statusStyles])}
                  >
                    {statusLabels[issue.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Reported on {format(issue.createdAt, 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Vendor
              </Button>
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
                    <h3 className="font-semibold text-lg text-foreground">{issue.issue}</h3>
                    <Badge variant="outline" className="mt-2">{issue.category}</Badge>
                  </div>
                  <p className="text-muted-foreground">{issue.description}</p>
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
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {issue.propertyAddress}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reporter Information */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-accent" />
                    Reported By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{issue.reportedBy}</p>
                        <p className="text-xs text-muted-foreground">{issue.reporterRole}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{issue.reporterEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{issue.reporterPhone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Issue History */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-accent" />
                    Issue History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {issue.history.map((entry, index) => (
                      <div key={index} className="relative pl-6 pb-4 last:pb-0">
                        {/* Timeline line */}
                        {index !== issue.history.length - 1 && (
                          <div className="absolute left-[9px] top-6 w-0.5 h-full bg-border" />
                        )}
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-accent" />
                        </div>
                        <div className="ml-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{entry.action}</p>
                            <span className="text-xs text-muted-foreground">
                              by {entry.user}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(entry.date, 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Notes */}
              {issue.vendorNotes.length > 0 && (
                <Card className="border-border/50 animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      Vendor Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {issue.vendorNotes.map((note, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <p className="text-foreground">{note.note}</p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                            <span className="text-sm font-medium text-accent">{note.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(note.date, 'MMM d, yyyy \'at\' h:mm a')}
                            </span>
                          </div>
                        </div>
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
                  {issue.assignedTo ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{issue.assignedTo}</p>
                          <p className="text-sm text-muted-foreground">{issue.category}</p>
                        </div>
                      </div>
                      <Separator />
                      {issue.vendorPhone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{issue.vendorPhone}</span>
                        </div>
                      )}
                      {issue.vendorEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{issue.vendorEmail}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No vendor assigned yet</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Assign Vendor
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card className="border-border/50 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-accent" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-medium">{formatCurrency(issue.estimatedCost)}</span>
                  </div>
                  {issue.actualCost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Actual Cost</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(issue.actualCost)}</span>
                    </div>
                  )}
                  {issue.costBreakdown.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        {issue.costBreakdown.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.item}</span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                    </>
                  )}
                  {issue.costBreakdown.length === 0 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">No cost breakdown available</p>
                    </div>
                  )}
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
                    <span>{format(issue.createdAt, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(issue.updatedAt, 'MMM d, yyyy')}</span>
                  </div>
                  {issue.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="text-emerald-600">{format(issue.updatedAt, 'MMM d, yyyy')}</span>
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
