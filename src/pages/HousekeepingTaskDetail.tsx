import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCog,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useHousekeepingTask, useUpdateTask, useDeleteTask, useAssignTask, type UpdateTask } from '@/hooks/useHousekeeping';
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

const HousekeepingTaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [editForm, setEditForm] = useState<UpdateTask>({});
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Fetch task data
  const { data: task, isLoading, error } = useHousekeepingTask(id);
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

  const handleOpenEditDialog = () => {
    if (!task) return;

    setEditForm({
      status: task.status as UpdateTask['status'],
      priority: task.priority as UpdateTask['priority'],
      description: task.description || '',
      special_instructions: task.special_instructions || '',
      estimated_duration_minutes: task.estimated_duration_minutes || undefined,
    });
    setEditDialogOpen(true);
  };

  const handleEditTask = async () => {
    if (!id) return;

    await updateTask.mutateAsync({
      id,
      updates: editForm,
    });
    setEditDialogOpen(false);
  };

  const handleOpenReassignDialog = () => {
    setSelectedStaffId(task?.assigned_to || '');
    setReassignDialogOpen(true);
  };

  const handleReassignTask = async () => {
    if (!id || !selectedStaffId) return;

    await assignTask.mutateAsync({
      taskId: id,
      staffId: selectedStaffId,
    });
    setReassignDialogOpen(false);
    setSelectedStaffId('');
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!id) return;

    await deleteTask.mutateAsync(id);
    setDeleteDialogOpen(false);
    navigate('/dashboard/housekeeping');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading task details...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-destructive mb-4">Error loading task details</div>
          <Button onClick={() => navigate('/dashboard/housekeeping')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Housekeeping
          </Button>
        </div>
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/housekeeping')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Task {task.task_number}
                </h1>
                <p className="text-muted-foreground mt-1">View and manage task details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenEditDialog}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleOpenReassignDialog}>
                <UserCog className="h-4 w-4 mr-2" />
                Reassign
              </Button>
              <Button variant="destructive" onClick={handleOpenDeleteDialog}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex gap-3">
            <Badge className={statusConfig[task.status as keyof typeof statusConfig].className}>
              {statusConfig[task.status as keyof typeof statusConfig].label}
            </Badge>
            <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig].className}>
              {priorityConfig[task.priority as keyof typeof priorityConfig].label}
            </Badge>
            <Badge variant="outline">
              {taskTypeLabels[task.task_type as keyof typeof taskTypeLabels]}
            </Badge>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Property & Location Info */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Property Information</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Property Name</Label>
                  <p className="text-lg font-medium">{task.property?.name || 'N/A'}</p>
                </div>
                {task.property?.address && (
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="text-sm">{task.property.address}</p>
                  </div>
                )}
                {task.booking && (
                  <div>
                    <Label className="text-muted-foreground">Related Booking</Label>
                    <p className="text-sm">Booking #{task.booking.id.slice(0, 8)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Info */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Assignment</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="text-lg font-medium">
                    {task.staff?.full_name || 'Unassigned'}
                  </p>
                </div>
                {task.assigned_at && (
                  <div>
                    <Label className="text-muted-foreground">Assigned At</Label>
                    <p className="text-sm">{format(new Date(task.assigned_at), 'PPp')}</p>
                  </div>
                )}
                {task.assignment_method && (
                  <div>
                    <Label className="text-muted-foreground">Assignment Method</Label>
                    <p className="text-sm capitalize">{task.assignment_method}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Info */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Schedule</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Scheduled For</Label>
                  <p className="text-lg font-medium">
                    {task.scheduled_for ? format(new Date(task.scheduled_for), 'PPp') : 'Not scheduled'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estimated Duration</Label>
                  <p className="text-sm">{task.estimated_duration_minutes} minutes</p>
                </div>
                {task.started_at && (
                  <div>
                    <Label className="text-muted-foreground">Started At</Label>
                    <p className="text-sm">{format(new Date(task.started_at), 'PPp')}</p>
                  </div>
                )}
                {task.completed_at && (
                  <div>
                    <Label className="text-muted-foreground">Completed At</Label>
                    <p className="text-sm">{format(new Date(task.completed_at), 'PPp')}</p>
                  </div>
                )}
                {task.actual_duration_minutes && (
                  <div>
                    <Label className="text-muted-foreground">Actual Duration</Label>
                    <p className="text-sm">{task.actual_duration_minutes} minutes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Task Details */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Task Details</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Task Type</Label>
                  <p className="text-lg font-medium">
                    {taskTypeLabels[task.task_type as keyof typeof taskTypeLabels]}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Task Number</Label>
                  <p className="text-sm font-mono">{task.task_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">{format(new Date(task.created_at), 'PPp')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description and Instructions */}
          <div className="space-y-6">
            {task.description && (
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {task.special_instructions && (
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-semibold">Special Instructions</h2>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.special_instructions}</p>
              </div>
            )}

            {task.completion_notes && (
              <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Completion Notes</h2>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.completion_notes}</p>
                {task.quality_rating && (
                  <div className="mt-4">
                    <Label className="text-muted-foreground">Quality Rating</Label>
                    <p className="text-sm">{task.quality_rating} / 5</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

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

export default HousekeepingTaskDetail;
