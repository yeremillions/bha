import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { useHousekeepingTasks } from '@/hooks/useHousekeeping';
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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch data
  const { data: allTasks = [], isLoading, error } = useHousekeepingTasks();

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

  const handleAction = (action: string, taskId: string) => {
    console.log('Action:', action, 'Task ID:', taskId);
    // TODO: Implement actions
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
            <Button onClick={() => handleAction('create', '')} className="bg-primary hover:bg-primary/90">
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
                                <DropdownMenuItem onClick={() => handleAction('view', task.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('edit', task.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAction('delete', task.id)} className="text-destructive">
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
    </div>
  );
};

export default Housekeeping;
