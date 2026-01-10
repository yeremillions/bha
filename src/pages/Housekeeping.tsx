import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Star,
  MoreHorizontal,
  UserPlus,
  Play,
  Package,
} from 'lucide-react';
import { useHousekeepingTasks, useHousekeepingStaff, useAssignTask, useUpdateTask, useAutoAssignTask } from '@/hooks/useHousekeeping';
import { format } from 'date-fns';

const priorityConfig = {
  urgent: { label: 'URGENT', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  high: { label: 'HIGH', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  normal: { label: 'NORMAL', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  low: { label: 'LOW', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30' },
};

const statusConfig = {
  in_progress: { label: 'In Progress', className: 'bg-sky-500 text-white' },
  assigned: { label: 'Assigned', className: 'bg-purple-500 text-white' },
  pending: { label: 'Pending', className: 'bg-amber-500 text-white' },
  completed: { label: 'Completed', className: 'bg-emerald-500 text-white' },
  unassigned: { label: 'Unassigned', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500 text-white' },
};

const taskTypeLabels = {
  checkout_clean: 'Checkout Clean',
  turnover: 'Turnover',
  regular_clean: 'Regular Clean',
  deep_clean: 'Deep Clean',
  inspection: 'Inspection',
  maintenance_support: 'Maintenance Support',
};

const Housekeeping = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch data from database
  const { data: allTasks = [], isLoading: tasksLoading } = useHousekeepingTasks();
  const { data: staff = [], isLoading: staffLoading } = useHousekeepingStaff('active');
  const assignTask = useAssignTask();
  const updateTask = useUpdateTask();
  const autoAssign = useAutoAssignTask();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [allTasks, statusFilter, priorityFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'pending' || t.status === 'assigned').length;
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const unassigned = allTasks.filter(t => t.status === 'unassigned').length;

    return [
      { label: 'Total Tasks', value: total, description: 'All cleaning tasks', icon: Sparkles, color: 'text-foreground' },
      { label: 'Pending', value: pending, description: 'Awaiting start', icon: Clock, color: 'text-amber-500' },
      { label: 'In Progress', value: inProgress, description: 'Currently cleaning', icon: Play, color: 'text-sky-500' },
      { label: 'Completed', value: completed, description: 'Finished tasks', icon: CheckCircle2, color: 'text-emerald-500' },
      { label: 'Unassigned', value: unassigned, description: 'Needs assignment', icon: AlertTriangle, color: 'text-rose-500' },
    ];
  }, [allTasks]);

  // Get today's tasks for each staff member
  const staffStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return staff.map(member => {
      const tasksToday = allTasks.filter(t =>
        t.assigned_to === member.id &&
        t.scheduled_for.startsWith(today)
      ).length;
      return {
        ...member,
        tasksToday,
      };
    });
  }, [staff, allTasks]);

  const handleAutoAssign = async (taskId: string) => {
    await autoAssign.mutateAsync(taskId);
  };

  const handleManualAssign = async (taskId: string, staffId: string) => {
    await assignTask.mutateAsync({ taskId, staffId });
  };

  const handleStatusUpdate = async (taskId: string, status: string) => {
    const updates: any = { status };
    if (status === 'in_progress' && !filteredTasks.find(t => t.id === taskId)?.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateTask.mutateAsync({ id: taskId, updates });
  };

  if (tasksLoading || staffLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading housekeeping data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-6 lg:p-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Housekeeping</h1>
              <p className="text-muted-foreground mt-1">Manage cleaning tasks and staff assignments</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-card p-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tasks Table */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>Cleaning Tasks</CardTitle>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                          <TableHead>Task #</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Scheduled</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No tasks found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTasks.map((task) => (
                            <TableRow key={task.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{task.task_number}</TableCell>
                              <TableCell>{task.property?.name || 'N/A'}</TableCell>
                              <TableCell>{taskTypeLabels[task.task_type as keyof typeof taskTypeLabels]}</TableCell>
                              <TableCell>
                                <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig].className}>
                                  {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                                </Badge>
                              </TableCell>
                              <TableCell>{task.staff?.full_name || 'Unassigned'}</TableCell>
                              <TableCell>{format(new Date(task.scheduled_for), 'MMM d, h:mm a')}</TableCell>
                              <TableCell>
                                <Badge className={statusConfig[task.status as keyof typeof statusConfig].className}>
                                  {statusConfig[task.status as keyof typeof statusConfig].label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-popover border-border">
                                    {task.status === 'unassigned' && (
                                      <DropdownMenuItem onClick={() => handleAutoAssign(task.id)}>
                                        Auto-Assign
                                      </DropdownMenuItem>
                                    )}
                                    {task.status === 'assigned' && (
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'in_progress')}>
                                        Start Task
                                      </DropdownMenuItem>
                                    )}
                                    {task.status === 'in_progress' && (
                                      <DropdownMenuItem onClick={() => handleStatusUpdate(task.id, 'completed')}>
                                        Mark Complete
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem>
                                      Reassign
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Staff & Inventory */}
            <div className="space-y-6">
              {/* Staff Overview */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Add Staff Button - Own Row */}
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </Button>

                  {/* Staff List */}
                  <div className="space-y-3">
                    {staffStats.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{member.full_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs text-muted-foreground">{member.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {member.total_tasks_completed} total
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {member.tasksToday} today
                          </Badge>
                        </div>
                        {member.phone && (
                          <p className="text-xs text-muted-foreground">{member.phone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Alerts */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {/* Sample Inventory Items */}
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-rose-600 dark:text-rose-400">Towel Sets</p>
                      <Badge className="bg-rose-500 text-white">Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current: 3</span>
                      <span className="text-muted-foreground">Threshold: 8</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-amber-600 dark:text-amber-400">Bed Linens (Queen)</p>
                      <Badge className="bg-amber-500 text-white">Low Stock</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current: 5</span>
                      <span className="text-muted-foreground">Threshold: 10</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-amber-600 dark:text-amber-400">Toilet Paper (Rolls)</p>
                      <Badge className="bg-amber-500 text-white">Low Stock</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current: 15</span>
                      <span className="text-muted-foreground">Threshold: 20</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">Cleaning Supplies</p>
                      <Badge className="bg-emerald-500 text-white">In Stock</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current: 12</span>
                      <span className="text-muted-foreground">Threshold: 10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Housekeeping;
