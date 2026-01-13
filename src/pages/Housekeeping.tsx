import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  UserCog,
} from 'lucide-react';
import { useHousekeepingTasks, useCreateTask, useUpdateTask, useDeleteTask, useAssignTask, type NewTask, type UpdateTask } from '@/hooks/useHousekeeping';
import { useProperties } from '@/hooks/useProperties';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const priorityConfig = {
  urgent: { label: 'URGENT', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  high: { label: 'HIGH', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  normal: { label: 'NORMAL', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  low: { label: 'LOW', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30' },
};

const statusConfig = {
  unassigned: { label: 'Unassigned', className: 'bg-muted text-muted-foreground' },
  assigned: { label: 'Assigned', className: 'bg-purple-500 text-white' },
  in_progress: { label: 'In Progress', className: 'bg-sky-500 text-white' },
  completed: { label: 'Completed', className: 'bg-emerald-500 text-white' },
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

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Form state
  const [taskForm, setTaskForm] = useState<NewTask>({
    property_id: '',
    task_type: 'regular_clean',
    priority: 'normal',
    scheduled_for: '',
    description: '',
    special_instructions: '',
    estimated_duration_minutes: 120,
  });

  const [editForm, setEditForm] = useState<UpdateTask>({});
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch data
  const { data: allTasks = [], isLoading, error } = useHousekeepingTasks();
  const { data: properties = [] } = useProperties();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask();

  // Fetch housekeeping staff from staff table
  const { data: housekeepingStaff = [] } = useQuery({
    queryKey: ['staff-housekeeping'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('department', 'housekeeping')
        .eq('employment_status', 'active')
        .order('full_name');

      if (error) throw error;
      return data;
    },
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesSearch = !searchQuery ||
        task.task_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.staff?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [allTasks, statusFilter, priorityFilter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'assigned' || t.status === 'unassigned').length;
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

  const handleOpenCreateDialog = () => {
    setTaskForm({
      property_id: '',
      task_type: 'regular_clean',
      priority: 'normal',
      scheduled_for: '',
      description: '',
      special_instructions: '',
      estimated_duration_minutes: 120,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!taskForm.property_id || !taskForm.scheduled_for) {
      return;
    }

    await createTask.mutateAsync(taskForm);
    setCreateDialogOpen(false);
  };

  const handleViewDetails = (taskId: string) => {
    // Navigate to task details page
    navigate(`/admin/housekeeping/${taskId}`);
  };

  const handleOpenEditDialog = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    setSelectedTaskId(taskId);
    setEditForm({
      status: task.status,
      priority: task.priority,
      description: task.description || '',
      special_instructions: task.special_instructions || '',
      estimated_duration_minutes: task.estimated_duration_minutes,
    });
    setEditDialogOpen(true);
  };

  const handleEditTask = async () => {
    if (!selectedTaskId) return;

    await updateTask.mutateAsync({
      id: selectedTaskId,
      updates: editForm,
    });
    setEditDialogOpen(false);
    setSelectedTaskId(null);
  };

  const handleOpenReassignDialog = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    setSelectedTaskId(taskId);
    setSelectedStaffId(task?.assigned_to || '');
    setReassignDialogOpen(true);
  };

  const handleReassignTask = async () => {
    if (!selectedTaskId || !selectedStaffId) return;

    await assignTask.mutateAsync({
      taskId: selectedTaskId,
      staffId: selectedStaffId,
    });
    setReassignDialogOpen(false);
    setSelectedTaskId(null);
    setSelectedStaffId('');
  };

  const handleOpenDeleteDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;

    await deleteTask.mutateAsync(selectedTaskId);
    setDeleteDialogOpen(false);
    setSelectedTaskId(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading housekeeping data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-destructive">Error loading data: {error.message}</div>
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
            <Button onClick={handleOpenCreateDialog} className="bg-primary hover:bg-primary/90">
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

          {/* Filters and Table */}
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="border-b border-border/50 p-6">
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by task number, property, or staff name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-2">
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
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-0">
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
                          <TableCell>
                            {task.scheduled_for ? format(new Date(task.scheduled_for), 'MMM d, h:mm a') : 'N/A'}
                          </TableCell>
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
                                <DropdownMenuItem onClick={() => handleViewDetails(task.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(task.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenReassignDialog(task.id)}>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Reassign
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenDeleteDialog(task.id)} className="text-destructive">
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
            </div>
          </div>
        </main>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Create a new housekeeping task</DialogDescription>
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

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}>
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

              <div>
                <Label htmlFor="estimated_duration_minutes">Duration (minutes)</Label>
                <Input
                  id="estimated_duration_minutes"
                  type="number"
                  value={taskForm.estimated_duration_minutes}
                  onChange={(e) => setTaskForm({ ...taskForm, estimated_duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Task description..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={taskForm.special_instructions}
                onChange={(e) => setTaskForm({ ...taskForm, special_instructions: e.target.value })}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!taskForm.property_id || !taskForm.scheduled_for || createTask.isPending}
            >
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select value={editForm.status} onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_priority">Priority</Label>
                <Select value={editForm.priority} onValueChange={(value: any) => setEditForm({ ...editForm, priority: value })}>
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
                <Label htmlFor="edit_duration">Duration (minutes)</Label>
                <Input
                  id="edit_duration"
                  type="number"
                  value={editForm.estimated_duration_minutes || ''}
                  onChange={(e) => setEditForm({ ...editForm, estimated_duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Task description..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit_special_instructions">Special Instructions</Label>
              <Textarea
                id="edit_special_instructions"
                value={editForm.special_instructions || ''}
                onChange={(e) => setEditForm({ ...editForm, special_instructions: e.target.value })}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={updateTask.isPending}>
              {updateTask.isPending ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Task Dialog */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>Assign this task to a different staff member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff_id">Staff Member *</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {housekeepingStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name} ({staff.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReassignTask} disabled={!selectedStaffId || assignTask.isPending}>
              {assignTask.isPending ? 'Reassigning...' : 'Reassign Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={deleteTask.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Housekeeping;
