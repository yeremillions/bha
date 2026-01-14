import { useState, useMemo } from 'react';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  useStaff,
  useStaffStats,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  type NewStaff,
} from '@/hooks/useStaff';
import type { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';

type Staff = Database['public']['Tables']['staff']['Row'];

const departments = [
  'reception',
  'bar',
  'maintenance',
  'security',
  'management',
  'housekeeping',
];

const employmentTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'casual', label: 'Casual' },
];

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-500 text-white' },
  on_leave: { label: 'On Leave', className: 'bg-amber-500 text-white' },
  suspended: { label: 'Suspended', className: 'bg-red-500 text-white' },
  terminated: { label: 'Terminated', className: 'bg-muted text-muted-foreground' },
};

const StaffPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected staff
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form state
  const [staffForm, setStaffForm] = useState<NewStaff>({
    full_name: '',
    email: '',
    phone: '',
    department: 'reception',
    position: '',
    employment_type: 'full_time',
    employment_status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    base_salary: 0,
    salary_currency: 'NGN',
    payment_frequency: 'monthly',
  });

  // Data fetching
  const { data: allStaff = [], isLoading } = useStaff();
  const { data: stats } = useStaffStats();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return allStaff.filter(staff => {
      const matchesSearch = !searchQuery ||
        staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.position?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || staff.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || staff.employment_status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [allStaff, searchQuery, departmentFilter, statusFilter]);

  // Statistics cards
  const statsCards = [
    { label: 'Total Staff', value: stats?.total || 0, icon: Users, color: 'text-foreground' },
    { label: 'Active', value: stats?.active || 0, icon: UserCheck, color: 'text-emerald-500' },
    { label: 'On Leave', value: stats?.onLeave || 0, icon: Clock, color: 'text-amber-500' },
    { label: 'Inactive', value: stats?.inactive || 0, icon: UserX, color: 'text-muted-foreground' },
  ];

  // Handlers
  const handleAddStaff = () => {
    setStaffForm({
      full_name: '',
      email: '',
      phone: '',
      department: 'reception',
      position: '',
      employment_type: 'full_time',
      employment_status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      base_salary: 0,
      salary_currency: 'NGN',
      payment_frequency: 'monthly',
    });
    setSelectedStaff(null);
    setAddDialogOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setStaffForm({
      full_name: staff.full_name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      position: staff.position,
      employment_type: staff.employment_type,
      employment_status: staff.employment_status,
      hire_date: staff.hire_date,
      base_salary: staff.base_salary,
      salary_currency: staff.salary_currency,
      payment_frequency: staff.payment_frequency,
      emergency_contact_name: staff.emergency_contact_name,
      emergency_contact_phone: staff.emergency_contact_phone,
      address: staff.address,
      city: staff.city,
      state: staff.state,
      notes: staff.notes,
    });
    setEditDialogOpen(true);
  };

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setViewDialogOpen(true);
  };

  const handleDeleteStaff = (staff: Staff) => {
    setStaffToDelete({ id: staff.id, name: staff.full_name });
    setDeleteDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    if (selectedStaff) {
      await updateStaff.mutateAsync({ id: selectedStaff.id, updates: staffForm });
      setEditDialogOpen(false);
    } else {
      await createStaff.mutateAsync(staffForm);
      setAddDialogOpen(false);
    }
    setSelectedStaff(null);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    await deleteStaff.mutateAsync(staffToDelete.id);
    setStaffToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading staff data...</div>
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

      <div className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Staff Management</h1>
              <p className="text-muted-foreground mt-1">Manage all employees and HR operations</p>
            </div>
            <Button onClick={handleAddStaff} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
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
              </div>
            ))}
          </div>

          {/* Staff Table */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col gap-4">
                <CardTitle>Staff Directory</CardTitle>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ID, or position..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept.charAt(0).toUpperCase() + dept.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Employment Type</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No staff found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStaff.map((staff) => (
                        <TableRow key={staff.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">{staff.employee_id}</TableCell>
                          <TableCell>{staff.full_name}</TableCell>
                          <TableCell className="capitalize">{staff.department}</TableCell>
                          <TableCell>{staff.position}</TableCell>
                          <TableCell className="capitalize">{staff.employment_type.replace('_', ' ')}</TableCell>
                          <TableCell>{format(new Date(staff.hire_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig[staff.employment_status as keyof typeof statusConfig].className}>
                              {statusConfig[staff.employment_status as keyof typeof statusConfig].label}
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
                                <DropdownMenuItem onClick={() => handleViewStaff(staff)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteStaff(staff)} className="text-destructive">
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

      {/* Add/Edit Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        setEditDialogOpen(open);
        if (!open) setSelectedStaff(null);
      }}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription>
              {selectedStaff ? 'Update staff member information' : 'Add a new employee to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={staffForm.full_name}
                  onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={staffForm.email || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={staffForm.phone || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={staffForm.department} onValueChange={(value) => setStaffForm({ ...staffForm, department: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={staffForm.position}
                  onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select value={staffForm.employment_type} onValueChange={(value: any) => setStaffForm({ ...staffForm, employment_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={staffForm.hire_date}
                  onChange={(e) => setStaffForm({ ...staffForm, hire_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="base_salary">Base Salary (NGN)</Label>
                <Input
                  id="base_salary"
                  type="number"
                  value={staffForm.base_salary || 0}
                  onChange={(e) => setStaffForm({ ...staffForm, base_salary: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="payment_frequency">Payment Frequency</Label>
                <Select value={staffForm.payment_frequency} onValueChange={(value) => setStaffForm({ ...staffForm, payment_frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={staffForm.notes || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
              setSelectedStaff(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveStaff} disabled={!staffForm.full_name || !staffForm.department || !staffForm.position || !staffForm.hire_date}>
              {selectedStaff ? 'Update' : 'Add'} Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details: {selectedStaff?.full_name}</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Employee ID</Label>
                  <p className="font-medium">{selectedStaff.employee_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium capitalize">{selectedStaff.department}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Position</Label>
                  <p className="font-medium">{selectedStaff.position}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Employment Type</Label>
                  <p className="font-medium capitalize">{selectedStaff.employment_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={statusConfig[selectedStaff.employment_status as keyof typeof statusConfig].className}>
                    {statusConfig[selectedStaff.employment_status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hire Date</Label>
                  <p className="font-medium">{format(new Date(selectedStaff.hire_date), 'PPP')}</p>
                </div>
                {selectedStaff.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedStaff.email}</p>
                  </div>
                )}
                {selectedStaff.phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedStaff.phone}</p>
                  </div>
                )}
                {selectedStaff.base_salary && (
                  <div>
                    <Label className="text-muted-foreground">Base Salary</Label>
                    <p className="font-medium">{selectedStaff.salary_currency} {selectedStaff.base_salary.toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedStaff.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedStaff.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Staff Member?"
        description={`Are you sure you want to delete ${staffToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default StaffPage;
