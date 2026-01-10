import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  Search,
  Pencil,
  Trash2,
  Eye,
  Calendar,
} from 'lucide-react';
import {
  useHousekeepingTasks,
  useHousekeepingStaff,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useAssignTask,
  useAutoAssignTask,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  type NewTask,
  type NewStaff,
  type HousekeepingTask,
  type HousekeepingStaff as StaffMember,
} from '@/hooks/useHousekeeping';
import { useProperties } from '@/hooks/useProperties';
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

const defaultChecklist = [
  { label: 'Change bed linens', completed: false },
  { label: 'Clean bathroom', completed: false },
  { label: 'Vacuum/mop floors', completed: false },
  { label: 'Dust surfaces', completed: false },
  { label: 'Restock amenities', completed: false },
  { label: 'Check appliances', completed: false },
];

const Housekeeping = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialog states
  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false);
  const [editStaffDialogOpen, setEditStaffDialogOpen] = useState(false);
  const [deleteStaffDialogOpen, setDeleteStaffDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);
  const [reassignTaskDialogOpen, setReassignTaskDialogOpen] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [completeTaskDialogOpen, setCompleteTaskDialogOpen] = useState(false);

  // Form states
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string } | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; number: string } | null>(null);

  const [staffForm, setStaffForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave',
    notes: '',
  });

  const [taskForm, setTaskForm] = useState({
    property_id: '',
    task_type: 'regular_clean' as NewTask['task_type'],
    priority: 'normal' as NewTask['priority'],
    scheduled_for: '',
    description: '',
    special_instructions: '',
    estimated_duration_minutes: 120,
  });

  const [completionForm, setCompletionForm] = useState({
    completion_notes: '',
    quality_rating: 5,
    actual_duration_minutes: 120,
  });

  const [reassignStaffId, setReassignStaffId] = useState('');
  const [taskChecklist, setTaskChecklist] = useState<Array<{ label: string; completed: boolean }>>(defaultChecklist);

  // Fetch data
  const { data: allTasks = [], isLoading: tasksLoading } = useHousekeepingTasks();
  const { data: staff = [], isLoading: staffLoading } = useHousekeepingStaff();
  const { data: properties = [] } = useProperties();

  // Mutations
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask();
  const autoAssign = useAutoAssignTask();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProperty = propertyFilter === 'all' || task.property_id === propertyFilter;
      const matchesSearch = !searchQuery ||
        task.task_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.staff?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDateFrom = !dateFrom || task.scheduled_for >= dateFrom;
      const matchesDateTo = !dateTo || task.scheduled_for <= dateTo;

      return matchesStatus && matchesPriority && matchesProperty && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [allTasks, statusFilter, priorityFilter, propertyFilter, searchQuery, dateFrom, dateTo]);

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

  // Handlers
  const handleAutoAssign = async (taskId: string) => {
    await autoAssign.mutateAsync(taskId);
  };

  const handleStatusUpdate = async (taskId: string, status: string) => {
    const task = allTasks.find(t => t.id === taskId);

    if (status === 'completed') {
      // Open completion dialog for quality rating
      setSelectedTask(task || null);
      setCompletionForm({
        completion_notes: '',
        quality_rating: 5,
        actual_duration_minutes: task?.estimated_duration_minutes || 120,
      });
      setCompleteTaskDialogOpen(true);
    } else {
      const updates: any = { status };
      if (status === 'in_progress' && !task?.started_at) {
        updates.started_at = new Date().toISOString();
      }
      await updateTask.mutateAsync({ id: taskId, updates });
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    await updateTask.mutateAsync({
      id: selectedTask.id,
      updates: {
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes: completionForm.completion_notes,
        quality_rating: completionForm.quality_rating,
        actual_duration_minutes: completionForm.actual_duration_minutes,
        checklist: taskChecklist,
      },
    });

    setCompleteTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleOpenStaffDialog = () => {
    setStaffForm({
      full_name: '',
      phone: '',
      email: '',
      status: 'active',
      notes: '',
    });
    setAddStaffDialogOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setSelectedStaff(member);
    setStaffForm({
      full_name: member.full_name,
      phone: member.phone || '',
      email: member.email || '',
      status: member.status as 'active' | 'inactive' | 'on_leave',
      notes: member.notes || '',
    });
    setEditStaffDialogOpen(true);
  };

  const handleDeleteStaff = (member: StaffMember) => {
    setStaffToDelete({ id: member.id, name: member.full_name });
    setDeleteStaffDialogOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    await deleteStaff.mutateAsync(staffToDelete.id);
    setStaffToDelete(null);
  };

  const handleSaveStaff = async () => {
    if (selectedStaff) {
      await updateStaff.mutateAsync({ id: selectedStaff.id, updates: staffForm });
      setEditStaffDialogOpen(false);
    } else {
      await createStaff.mutateAsync(staffForm);
      setAddStaffDialogOpen(false);
    }
    setSelectedStaff(null);
  };

  const handleOpenCreateTaskDialog = () => {
    setTaskForm({
      property_id: '',
      task_type: 'regular_clean',
      priority: 'normal',
      scheduled_for: '',
      description: '',
      special_instructions: '',
      estimated_duration_minutes: 120,
    });
    setCreateTaskDialogOpen(true);
  };

  const handleCreateTask = async () => {
    await createTask.mutateAsync(taskForm);
    setCreateTaskDialogOpen(false);
  };

  const handleViewTask = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setTaskChecklist((task.checklist as any) || defaultChecklist);
    setViewTaskDialogOpen(true);
  };

  const handleEditTask = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setTaskForm({
      property_id: task.property_id,
      task_type: task.task_type as NewTask['task_type'],
      priority: task.priority as NewTask['priority'],
      scheduled_for: task.scheduled_for.split('T')[0] + 'T' + task.scheduled_for.split('T')[1].substring(0, 5),
      description: task.description || '',
      special_instructions: task.special_instructions || '',
      estimated_duration_minutes: task.estimated_duration_minutes || 120,
    });
    setEditTaskDialogOpen(true);
  };

  const handleSaveEditTask = async () => {
    if (!selectedTask) return;
    await updateTask.mutateAsync({
      id: selectedTask.id,
      updates: taskForm,
    });
    setEditTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleOpenReassignDialog = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setReassignStaffId(task.assigned_to || '');
    setReassignTaskDialogOpen(true);
  };

  const handleReassignTask = async () => {
    if (!selectedTask || !reassignStaffId) return;
    await assignTask.mutateAsync({ taskId: selectedTask.id, staffId: reassignStaffId });
    setReassignTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (task: HousekeepingTask) => {
    setTaskToDelete({ id: task.id, number: task.task_number });
    setDeleteTaskDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    await deleteTask.mutateAsync(taskToDelete.id);
    setTaskToDelete(null);
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
            <Button onClick={handleOpenCreateTaskDialog} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
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

          {/* Staff Overview and Inventory Alerts Row */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Staff Overview */}
            <Card className="border-border/50 bg-card">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Add Staff Button */}
                <Button onClick={handleOpenStaffDialog} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </Button>

                {/* Staff List */}
                <div className="space-y-3">
                  {staffStats.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="ml-2">
                            {member.tasksToday} today
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteStaff(member)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

          {/* Cleaning Tasks Table */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col gap-4">
                <CardTitle>Cleaning Tasks</CardTitle>

                {/* Search and Filters */}
                <div className="space-y-3">
                  {/* Row 1: Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks by number, property, or staff name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Row 2: Filters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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

                    <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="From"
                    />

                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="To"
                    />
                  </div>
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
                                <DropdownMenuItem onClick={() => handleViewTask(task)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                                <DropdownMenuItem onClick={() => handleOpenReassignDialog(task)}>
                                  Reassign
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteTask(task)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
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
        </main>
      </div>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={addStaffDialogOpen || editStaffDialogOpen} onOpenChange={(open) => {
        setAddStaffDialogOpen(open);
        setEditStaffDialogOpen(open);
        if (!open) setSelectedStaff(null);
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
            <DialogDescription>
              {selectedStaff ? 'Update staff member information' : 'Add a new housekeeping staff member'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={staffForm.full_name}
                onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={staffForm.status} onValueChange={(value: any) => setStaffForm({ ...staffForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={staffForm.notes}
                onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddStaffDialogOpen(false);
              setEditStaffDialogOpen(false);
              setSelectedStaff(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveStaff} disabled={!staffForm.full_name}>
              {selectedStaff ? 'Update' : 'Add'} Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Task Dialog */}
      <Dialog open={createTaskDialogOpen || editTaskDialogOpen} onOpenChange={(open) => {
        setCreateTaskDialogOpen(open);
        setEditTaskDialogOpen(open);
        if (!open) setSelectedTask(null);
      }}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Update task details' : 'Create a new housekeeping task'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_id">Property *</Label>
                <Select value={taskForm.property_id} onValueChange={(value) => setTaskForm({ ...taskForm, property_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task_type">Task Type *</Label>
                <Select value={taskForm.task_type} onValueChange={(value: any) => setTaskForm({ ...taskForm, task_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkout_clean">Checkout Clean</SelectItem>
                    <SelectItem value="turnover">Turnover</SelectItem>
                    <SelectItem value="regular_clean">Regular Clean</SelectItem>
                    <SelectItem value="deep_clean">Deep Clean</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="maintenance_support">Maintenance Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskForm.priority || 'normal'} onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduled_for">Scheduled For *</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={taskForm.scheduled_for}
                  onChange={(e) => setTaskForm({ ...taskForm, scheduled_for: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
              <Input
                id="estimated_duration"
                type="number"
                value={taskForm.estimated_duration_minutes}
                onChange={(e) => setTaskForm({ ...taskForm, estimated_duration_minutes: parseInt(e.target.value) || 120 })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Task description..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={taskForm.special_instructions}
                onChange={(e) => setTaskForm({ ...taskForm, special_instructions: e.target.value })}
                placeholder="Any special requirements..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateTaskDialogOpen(false);
              setEditTaskDialogOpen(false);
              setSelectedTask(null);
            }}>
              Cancel
            </Button>
            <Button onClick={selectedTask ? handleSaveEditTask : handleCreateTask} disabled={!taskForm.property_id || !taskForm.scheduled_for}>
              {selectedTask ? 'Update' : 'Create'} Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={viewTaskDialogOpen} onOpenChange={setViewTaskDialogOpen}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle>Task Details: {selectedTask?.task_number}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Property</Label>
                  <p className="font-medium">{selectedTask.property?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{taskTypeLabels[selectedTask.task_type as keyof typeof taskTypeLabels]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Badge className={priorityConfig[selectedTask.priority as keyof typeof priorityConfig].className}>
                    {priorityConfig[selectedTask.priority as keyof typeof priorityConfig].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={statusConfig[selectedTask.status as keyof typeof statusConfig].className}>
                    {statusConfig[selectedTask.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="font-medium">{selectedTask.staff?.full_name || 'Unassigned'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scheduled</Label>
                  <p className="font-medium">{format(new Date(selectedTask.scheduled_for), 'PPp')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estimated Duration</Label>
                  <p className="font-medium">{selectedTask.estimated_duration_minutes} minutes</p>
                </div>
                {selectedTask.actual_duration_minutes && (
                  <div>
                    <Label className="text-muted-foreground">Actual Duration</Label>
                    <p className="font-medium">{selectedTask.actual_duration_minutes} minutes</p>
                  </div>
                )}
              </div>

              {selectedTask.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              )}

              {selectedTask.special_instructions && (
                <div>
                  <Label className="text-muted-foreground">Special Instructions</Label>
                  <p className="text-sm">{selectedTask.special_instructions}</p>
                </div>
              )}

              {selectedTask.completion_notes && (
                <div>
                  <Label className="text-muted-foreground">Completion Notes</Label>
                  <p className="text-sm">{selectedTask.completion_notes}</p>
                </div>
              )}

              {selectedTask.quality_rating && (
                <div>
                  <Label className="text-muted-foreground">Quality Rating</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-5 w-5',
                          star <= selectedTask.quality_rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {taskChecklist && taskChecklist.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Checklist</Label>
                  <div className="space-y-2">
                    {taskChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Checkbox checked={item.completed} disabled />
                        <span className={cn('text-sm', item.completed && 'line-through text-muted-foreground')}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewTaskDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={completeTaskDialogOpen} onOpenChange={setCompleteTaskDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>Add completion details and quality rating</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Checklist</Label>
              <div className="space-y-2 mt-2">
                {taskChecklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => {
                        const newChecklist = [...taskChecklist];
                        newChecklist[index].completed = !!checked;
                        setTaskChecklist(newChecklist);
                      }}
                    />
                    <span className={cn('text-sm', item.completed && 'line-through text-muted-foreground')}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="actual_duration">Actual Duration (minutes)</Label>
              <Input
                id="actual_duration"
                type="number"
                value={completionForm.actual_duration_minutes}
                onChange={(e) => setCompletionForm({ ...completionForm, actual_duration_minutes: parseInt(e.target.value) || 120 })}
              />
            </div>

            <div>
              <Label>Quality Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-6 w-6 cursor-pointer transition-colors',
                      star <= completionForm.quality_rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-amber-400/50'
                    )}
                    onClick={() => setCompletionForm({ ...completionForm, quality_rating: star })}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="completion_notes">Completion Notes</Label>
              <Textarea
                id="completion_notes"
                value={completionForm.completion_notes}
                onChange={(e) => setCompletionForm({ ...completionForm, completion_notes: e.target.value })}
                placeholder="Any notes about the completed task..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteTask}>
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Task Dialog */}
      <Dialog open={reassignTaskDialogOpen} onOpenChange={setReassignTaskDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>Select a new staff member for this task</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reassign_staff">Staff Member</Label>
            <Select value={reassignStaffId} onValueChange={setReassignStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.filter(s => s.status === 'active').map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} ({member.tasksToday || 0} tasks today)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReassignTask} disabled={!reassignStaffId}>
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={deleteStaffDialogOpen}
        onOpenChange={setDeleteStaffDialogOpen}
        onConfirm={confirmDeleteStaff}
        title="Delete Staff Member?"
        description={`Are you sure you want to delete ${staffToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteTaskDialogOpen}
        onOpenChange={setDeleteTaskDialogOpen}
        onConfirm={confirmDeleteTask}
        title="Delete Task?"
        description={`Are you sure you want to delete task ${taskToDelete?.number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default Housekeeping;
