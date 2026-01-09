import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Package, 
  Star,
  MoreHorizontal,
  Eye,
  UserPlus,
  Play,
  Pause,
  XCircle,
  ArrowRight
} from 'lucide-react';

// Mock data
const stats = [
  { label: 'Total Tasks', value: 5, description: 'All cleaning tasks', icon: Sparkles, color: 'text-foreground' },
  { label: 'Pending', value: 2, description: 'Awaiting start', icon: Clock, color: 'text-amber-500' },
  { label: 'In Progress', value: 1, description: 'Currently cleaning', icon: Play, color: 'text-sky-500' },
  { label: 'Completed', value: 1, description: 'Finished today', icon: CheckCircle2, color: 'text-emerald-500' },
  { label: 'Unassigned', value: 1, description: 'Needs assignment', icon: AlertTriangle, color: 'text-rose-500' },
];

const staff = [
  { name: 'Mary Obi', tasksToday: 3, rating: 4.9, completed: 12 },
  { name: 'Grace Eze', tasksToday: 2, rating: 4.8, completed: 15 },
  { name: 'Blessing Okoro', tasksToday: 4, rating: 4.7, completed: 8 },
  { name: 'Fatima Ibrahim', tasksToday: 1, rating: 4.9, completed: 10 },
];

const inventory = [
  { item: 'Bed Linens (Queen)', current: 5, threshold: 10, status: 'low' },
  { item: 'Towel Sets', current: 3, threshold: 8, status: 'critical' },
  { item: 'Cleaning Supplies', current: 12, threshold: 10, status: 'in_stock' },
  { item: 'Toilet Paper (Rolls)', current: 15, threshold: 20, status: 'low' },
];

const tasks = [
  { id: 'CL001', property: 'Property #1', type: 'Checkout Clean', priority: 'urgent', assignee: 'Mary Obi', scheduled: 'Jan 2, 5:00 AM', duration: 180, status: 'in_progress' },
  { id: 'CL002', property: 'Property #2', type: 'Turnover', priority: 'high', assignee: 'Grace Eze', scheduled: 'Jan 2, 9:00 AM', duration: 120, status: 'pending' },
  { id: 'CL003', property: 'Property #3', type: 'Regular Clean', priority: 'normal', assignee: 'Blessing Okoro', scheduled: 'Jan 3, 4:00 AM', duration: 90, status: 'pending' },
  { id: 'CL004', property: 'Property #4', type: 'Inspection', priority: 'normal', assignee: 'Unassigned', scheduled: 'Jan 3, 6:00 AM', duration: 60, status: 'unassigned' },
  { id: 'CL005', property: 'Property #1', type: 'Checkout Clean', priority: 'urgent', assignee: 'Fatima Ibrahim', scheduled: 'Jan 2, 3:00 AM', duration: 180, status: 'completed' },
];

const priorityConfig = {
  urgent: { label: 'URGENT', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  high: { label: 'HIGH', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  normal: { label: 'NORMAL', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
};

const statusConfig = {
  in_progress: { label: 'In Progress', className: 'bg-sky-500 text-white' },
  pending: { label: 'Pending', className: 'bg-amber-500 text-white' },
  completed: { label: 'Completed', className: 'bg-emerald-500 text-white' },
  unassigned: { label: 'Unassigned', className: 'bg-muted text-muted-foreground' },
};

const inventoryStatusConfig = {
  critical: { label: 'Critical', className: 'bg-rose-500 text-white' },
  low: { label: 'Low Stock', className: 'bg-amber-500 text-white' },
  in_stock: { label: 'In Stock', className: 'bg-emerald-500 text-white' },
};

const Housekeeping = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
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
              <p className="text-muted-foreground mt-1">Manage cleaning tasks, staff assignments, and inventory</p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <Plus className="h-4 w-4" />
              New Task
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

          {/* Middle Section: Staff Overview & Inventory */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Staff Overview */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-6 pb-4 border-b border-border/50">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-display font-semibold text-foreground">Staff Overview</h3>
              </div>
              <div className="divide-y divide-border/50">
                {staff.map((member, index) => (
                  <div 
                    key={member.name}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{member.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{member.tasksToday} tasks today</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">{member.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                      {member.completed} done
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-display font-semibold text-foreground">Inventory Alerts</h3>
                </div>
                <Link 
                  to="/dashboard/housekeeping/inventory" 
                  className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 group"
                >
                  View All 
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="divide-y divide-border/50">
                {inventory.map((item, index) => {
                  const config = inventoryStatusConfig[item.status as keyof typeof inventoryStatusConfig];
                  return (
                    <div 
                      key={item.item}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div>
                        <p className="font-semibold text-foreground">{item.item}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Current: {item.current} | Threshold: {item.threshold}
                        </p>
                      </div>
                      <Badge className={cn('text-xs', config.className)}>
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cleaning Tasks - Mobile Card View */}
          <div className="md:hidden space-y-4">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Cleaning Tasks</h3>
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-center">No tasks match your filters</p>
              </div>
            ) : (
              filteredTasks.map((task, index) => {
                const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
                const status = statusConfig[task.status as keyof typeof statusConfig];

                return (
                  <div
                    key={task.id}
                    className="relative rounded-2xl border border-border/50 bg-card p-4 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header with ID and Priority */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Task ID</p>
                        <p className="font-semibold text-foreground">{task.id}</p>
                      </div>
                      <Badge variant="outline" className={cn('text-xs', priority.className)}>
                        {priority.label}
                      </Badge>
                    </div>

                    {/* Property and Type */}
                    <div className="mb-3 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <p className="font-medium text-foreground">{task.property}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.type}</p>
                    </div>

                    {/* Assignment and Schedule */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                        <p className={cn(
                          "text-sm font-medium",
                          task.assignee === 'Unassigned' && 'text-amber-600 dark:text-amber-400'
                        )}>
                          {task.assignee}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="text-sm font-medium text-foreground">{task.duration} min</p>
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
                      <p className="text-sm font-medium text-foreground">{task.scheduled}</p>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <Badge className={cn('text-xs', status.className)}>
                        {status.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {task.status === 'unassigned' && (
                            <DropdownMenuItem className="gap-2">
                              <UserPlus className="h-4 w-4" /> Assign Staff
                            </DropdownMenuItem>
                          )}
                          {task.status === 'pending' && (
                            <DropdownMenuItem className="gap-2">
                              <Play className="h-4 w-4" /> Start Task
                            </DropdownMenuItem>
                          )}
                          {task.status === 'in_progress' && (
                            <>
                              <DropdownMenuItem className="gap-2">
                                <Pause className="h-4 w-4" /> Pause Task
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" /> Mark Complete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <XCircle className="h-4 w-4" /> Cancel Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}

            <div className="p-4 text-sm text-muted-foreground text-center">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>

          {/* Cleaning Tasks - Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-display font-semibold text-foreground">Cleaning Tasks</h3>
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold w-[80px]">ID</TableHead>
                    <TableHead className="font-semibold w-[150px]">Property</TableHead>
                    <TableHead className="font-semibold w-[140px]">Type</TableHead>
                    <TableHead className="font-semibold w-[100px]">Priority</TableHead>
                    <TableHead className="font-semibold w-[140px]">Assigned To</TableHead>
                    <TableHead className="font-semibold w-[140px]">Scheduled</TableHead>
                    <TableHead className="font-semibold w-[100px]">Duration</TableHead>
                    <TableHead className="font-semibold w-[120px]">Status</TableHead>
                    <TableHead className="font-semibold text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No tasks match your filters</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task, index) => {
                      const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
                      const status = statusConfig[task.status as keyof typeof statusConfig];

                      return (
                        <TableRow
                          key={task.id}
                          className="border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-foreground">{task.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-accent" />
                              {task.property}
                            </div>
                          </TableCell>
                          <TableCell>{task.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-xs', priority.className)}>
                              {priority.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              task.assignee === 'Unassigned' && 'text-amber-600 dark:text-amber-400'
                            )}>
                              {task.assignee}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{task.scheduled}</TableCell>
                          <TableCell>{task.duration} min</TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', status.className)}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-popover">
                                <DropdownMenuItem className="gap-2">
                                  <Eye className="h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                {task.status === 'unassigned' && (
                                  <DropdownMenuItem className="gap-2">
                                    <UserPlus className="h-4 w-4" /> Assign Staff
                                  </DropdownMenuItem>
                                )}
                                {task.status === 'pending' && (
                                  <DropdownMenuItem className="gap-2">
                                    <Play className="h-4 w-4" /> Start Task
                                  </DropdownMenuItem>
                                )}
                                {task.status === 'in_progress' && (
                                  <>
                                    <DropdownMenuItem className="gap-2">
                                      <Pause className="h-4 w-4" /> Pause Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 text-emerald-600">
                                      <CheckCircle2 className="h-4 w-4" /> Mark Complete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 text-destructive">
                                  <XCircle className="h-4 w-4" /> Cancel Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Housekeeping;
