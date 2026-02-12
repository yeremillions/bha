import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { useBookingsPaginated } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  Save,
  X,
  Edit2,
  Crown,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dialog state
  const [cancelEditDialogOpen, setCancelEditDialogOpen] = useState(false);
  const [leavePageDialogOpen, setLeavePageDialogOpen] = useState(false);

  // Fetch customer and their bookings with pagination
  const { data: customer, isLoading: customerLoading, error } = useCustomer(id);
  const { data: paginatedBookings } = useBookingsPaginated(
    { customerId: id },
    { page: 1, pageSize: 100 } // Reasonable page size for customer bookings
  );
  const allBookings = paginatedBookings?.data || [];
  const updateCustomer = useUpdateCustomer();

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    date_of_birth: '',
    nationality: '',
    id_type: '' as 'passport' | 'drivers_license' | 'national_id' | '',
    id_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  });

  // Populate form when customer data loads
  useEffect(() => {
    if (customer) {
      setEditForm({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        whatsapp: customer.whatsapp || '',
        date_of_birth: customer.date_of_birth || '',
        nationality: customer.nationality || '',
        id_type: (customer.id_type as 'passport' | 'drivers_license' | 'national_id') || '',
        id_number: customer.id_number || '',
        emergency_contact_name: customer.emergency_contact_name || '',
        emergency_contact_phone: customer.emergency_contact_phone || '',
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  // Track changes to form
  useEffect(() => {
    if (customer && isEditing) {
      const changed =
        editForm.full_name !== (customer.full_name || '') ||
        editForm.email !== (customer.email || '') ||
        editForm.phone !== (customer.phone || '') ||
        editForm.whatsapp !== (customer.whatsapp || '') ||
        editForm.date_of_birth !== (customer.date_of_birth || '') ||
        editForm.nationality !== (customer.nationality || '') ||
        editForm.id_type !== (customer.id_type || '') ||
        editForm.id_number !== (customer.id_number || '') ||
        editForm.emergency_contact_name !== (customer.emergency_contact_name || '') ||
        editForm.emergency_contact_phone !== (customer.emergency_contact_phone || '') ||
        editForm.notes !== (customer.notes || '');
      setHasUnsavedChanges(changed);
    }
  }, [editForm, customer, isEditing]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Calculate customer stats
  const stats = useMemo(() => {
    const bookings = allBookings.length;
    const totalSpent = allBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
    const completedBookings = allBookings.filter(b => b.status === 'completed').length;
    const upcomingBookings = allBookings.filter(
      b => b.status === 'confirmed' || b.status === 'pending'
    ).length;
    const averageBookingValue = bookings > 0 ? totalSpent / bookings : 0;

    return {
      totalBookings: bookings,
      totalSpent,
      completedBookings,
      upcomingBookings,
      averageBookingValue,
    };
  }, [allBookings]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setLeavePageDialogOpen(true);
    } else {
      navigate('/dashboard/customers');
    }
  };

  const confirmLeavePage = () => {
    navigate('/dashboard/customers');
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setCancelEditDialogOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmCancelEdit = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    // Reset form to original values
    if (customer) {
      setEditForm({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        whatsapp: customer.whatsapp || '',
        date_of_birth: customer.date_of_birth || '',
        nationality: customer.nationality || '',
        id_type: (customer.id_type as 'passport' | 'drivers_license' | 'national_id') || '',
        id_number: customer.id_number || '',
        emergency_contact_name: customer.emergency_contact_name || '',
        emergency_contact_phone: customer.emergency_contact_phone || '',
        notes: customer.notes || '',
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!customer) return;

    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        updates: {
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone || undefined,
          whatsapp: editForm.whatsapp || undefined,
          date_of_birth: editForm.date_of_birth || undefined,
          nationality: editForm.nationality || undefined,
          id_type: editForm.id_type || undefined,
          id_number: editForm.id_number || undefined,
          emergency_contact_name: editForm.emergency_contact_name || undefined,
          emergency_contact_phone: editForm.emergency_contact_phone || undefined,
          notes: editForm.notes || undefined,
        },
      });
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
      confirmed: 'bg-sky-500/20 text-sky-600 border-sky-500/30',
      checked_in: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
      completed: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || ''}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Show loading state
  if (authLoading || customerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading customer details...</div>
      </div>
    );
  }

  // Show error state
  if (error || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'The customer you are looking for does not exist.'}
          </p>
          <Button onClick={() => navigate('/dashboard/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mb-6 hover:bg-accent/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Profile Card */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                        <User className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{customer.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Customer since {formatDate(customer.created_at)}
                        </p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button onClick={handleEditClick} variant="outline">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={editForm.full_name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, full_name: e.target.value })
                            }
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                        <div>
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            id="whatsapp"
                            value={editForm.whatsapp}
                            onChange={(e) =>
                              setEditForm({ ...editForm, whatsapp: e.target.value })
                            }
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                        <div>
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={editForm.date_of_birth}
                            onChange={(e) =>
                              setEditForm({ ...editForm, date_of_birth: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="nationality">Nationality</Label>
                          <Input
                            id="nationality"
                            value={editForm.nationality}
                            onChange={(e) =>
                              setEditForm({ ...editForm, nationality: e.target.value })
                            }
                            placeholder="e.g., Nigerian"
                          />
                        </div>
                        <div>
                          <Label htmlFor="id_type">ID Type</Label>
                          <Select
                            value={editForm.id_type}
                            onValueChange={(value) =>
                              setEditForm({
                                ...editForm,
                                id_type: value as 'passport' | 'drivers_license' | 'national_id',
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                              <SelectItem value="national_id">National ID</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="id_number">ID Number</Label>
                          <Input
                            id="id_number"
                            value={editForm.id_number}
                            onChange={(e) =>
                              setEditForm({ ...editForm, id_number: e.target.value })
                            }
                            placeholder="ID number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                          <Input
                            id="emergency_contact_name"
                            value={editForm.emergency_contact_name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, emergency_contact_name: e.target.value })
                            }
                            placeholder="Emergency contact name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                          <Input
                            id="emergency_contact_phone"
                            value={editForm.emergency_contact_phone}
                            onChange={(e) =>
                              setEditForm({ ...editForm, emergency_contact_phone: e.target.value })
                            }
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          placeholder="Add any notes about this customer..."
                          rows={4}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveChanges}
                          disabled={!hasUnsavedChanges || updateCustomer.isPending}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          disabled={updateCustomer.isPending}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-6">
                      {/* Contact Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Contact Information
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="text-sm font-medium">{customer.email}</p>
                            </div>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium">{customer.phone}</p>
                              </div>
                            </div>
                          )}
                          {customer.whatsapp && (
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">WhatsApp</p>
                                <p className="text-sm font-medium">{customer.whatsapp}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Personal Information */}
                      {(customer.date_of_birth || customer.nationality) && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Personal Information
                          </h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {customer.date_of_birth && (
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                                  <p className="text-sm font-medium">
                                    {formatDate(customer.date_of_birth)}
                                  </p>
                                </div>
                              </div>
                            )}
                            {customer.nationality && (
                              <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Nationality</p>
                                  <p className="text-sm font-medium">{customer.nationality}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ID Information */}
                      {(customer.id_type || customer.id_number) && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Identification
                          </h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {customer.id_type && (
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">ID Type</p>
                                  <p className="text-sm font-medium capitalize">
                                    {customer.id_type.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>
                            )}
                            {customer.id_number && (
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">ID Number</p>
                                  <p className="text-sm font-medium">{customer.id_number}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      {(customer.emergency_contact_name || customer.emergency_contact_phone) && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Emergency Contact
                          </h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {customer.emergency_contact_name && (
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Name</p>
                                  <p className="text-sm font-medium">
                                    {customer.emergency_contact_name}
                                  </p>
                                </div>
                              </div>
                            )}
                            {customer.emergency_contact_phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Phone</p>
                                  <p className="text-sm font-medium">
                                    {customer.emergency_contact_phone}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {customer.notes && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Notes
                          </h3>
                          <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                            {customer.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking History */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <CardTitle>Booking History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {allBookings.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No bookings yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead>Booking #</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allBookings.map((booking) => (
                            <TableRow
                              key={booking.id}
                              className="cursor-pointer hover:bg-muted/30 transition-colors"
                              onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                            >
                              <TableCell className="font-medium">
                                {booking.booking_number}
                              </TableCell>
                              <TableCell>{booking.property?.name || 'N/A'}</TableCell>
                              <TableCell>{formatDate(booking.check_in_date)}</TableCell>
                              <TableCell>{formatDate(booking.check_out_date)}</TableCell>
                              <TableCell>{getStatusBadge(booking.status)}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(booking.total_amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* VIP Status */}
              {customer.vip_status && (
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                  <CardContent className="p-6 text-center">
                    <Crown className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      VIP Customer
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Premium guest with exclusive benefits
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-sm">Customer Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Bookings</p>
                        <p className="text-xl font-bold">{stats.totalBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-xl font-bold">{stats.completedBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Upcoming</p>
                        <p className="text-xl font-bold">{stats.upcomingBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                        <p className="text-lg font-bold">{formatCurrency(stats.totalSpent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Booking Value</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(stats.averageBookingValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={cancelEditDialogOpen}
        onOpenChange={setCancelEditDialogOpen}
        onConfirm={confirmCancelEdit}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to cancel editing? Your changes will be lost."
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="destructive"
      />

      <ConfirmDialog
        open={leavePageDialogOpen}
        onOpenChange={setLeavePageDialogOpen}
        onConfirm={confirmLeavePage}
        title="Leave Page?"
        description="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
        confirmText="Leave Page"
        cancelText="Stay"
        variant="destructive"
      />
    </div>
  );
};

export default CustomerDetails;
