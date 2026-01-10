import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBooking, useUpdateBooking, useUpdateBookingStatus, useCancelBooking } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ArrowLeft,
  Calendar,
  User,
  Home,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Users,
  Clock,
  FileText,
  Edit,
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  X as CancelIcon,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'checked-in':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'cancelled':
      return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'partial':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'refunded':
      return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const BookingDetails = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch booking data from database
  const { data: booking, isLoading: bookingLoading, error } = useBooking(id);
  const updateBooking = useUpdateBooking();
  const updateBookingStatus = useUpdateBookingStatus();
  const cancelBooking = useCancelBooking();

  // Edit form state
  const [editForm, setEditForm] = useState({
    check_in_date: '',
    check_out_date: '',
    num_guests: 0,
    special_requests: '',
    payment_status: '' as 'pending' | 'paid' | 'refunded' | 'partial',
    status: '' as 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled',
  });

  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form when booking loads or edit mode starts
  useEffect(() => {
    if (booking && isEditing) {
      setEditForm({
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        num_guests: booking.num_guests,
        special_requests: booking.special_requests || '',
        payment_status: booking.payment_status,
        status: booking.status,
      });
      setHasUnsavedChanges(false);
    }
  }, [booking, isEditing]);

  // Track changes to form
  useEffect(() => {
    if (booking && isEditing) {
      const changed =
        editForm.check_in_date !== booking.check_in_date ||
        editForm.check_out_date !== booking.check_out_date ||
        editForm.num_guests !== booking.num_guests ||
        editForm.special_requests !== (booking.special_requests || '') ||
        editForm.payment_status !== booking.payment_status ||
        editForm.status !== booking.status;
      setHasUnsavedChanges(changed);
    }
  }, [editForm, booking, isEditing]);

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

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setIsEditing(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
        navigate('/dashboard/bookings');
      }
    } else {
      navigate('/dashboard/bookings');
    }
  };

  const handleSaveEdit = async () => {
    if (!booking) return;

    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        updates: editForm,
      });
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  // Handle status updates
  const handleCheckIn = async () => {
    if (!booking) return;
    try {
      await updateBookingStatus.mutateAsync({ id: booking.id, status: 'checked_in' });
      toast({
        title: 'Guest Checked In',
        description: 'The guest has been successfully checked in.',
      });
    } catch (error) {
      console.error('Failed to check in:', error);
      toast({
        title: 'Error Checking In',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckOut = async () => {
    if (!booking) return;
    try {
      await updateBookingStatus.mutateAsync({ id: booking.id, status: 'completed' });
      toast({
        title: 'Guest Checked Out',
        description: 'The guest has been successfully checked out.',
      });
    } catch (error) {
      console.error('Failed to check out:', error);
      toast({
        title: 'Error Checking Out',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (window.confirm('Are you sure you want to cancel this booking? This will refund the payment and cannot be undone.')) {
      try {
        await cancelBooking.mutateAsync({ id: booking.id, refund: true });
        toast({
          title: 'Booking Cancelled',
          description: 'The booking has been successfully cancelled.',
        });
        navigate('/dashboard/bookings');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        toast({
          title: 'Error Cancelling Booking',
          description: error instanceof Error ? error.message : 'An unexpected error occurred while cancelling the booking.',
          variant: 'destructive',
        });
      }
    }
  };

  // Show loading state
  if (authLoading || bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}>
          <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <XCircle className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Booking Not Found</h2>
              <p className="text-muted-foreground">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button onClick={() => navigate('/dashboard/bookings')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = differenceInDays(checkOutDate, checkInDate);
  const pricePerNight = nights > 0 ? booking.base_amount / nights : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackClick}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{booking.booking_number}</h1>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Booked on {format(new Date(booking.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isEditing ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={updateBooking.isPending}
                  >
                    {updateBooking.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={updateBooking.isPending}
                  >
                    <CancelIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Guest
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleEditClick}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleCancel}
                    disabled={cancelBooking.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{booking.customer?.full_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{booking.customer?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{booking.customer?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">{booking.num_guests} {booking.num_guests === 1 ? 'guest' : 'guests'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property & Stay Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property & Stay Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{booking.property?.name || 'N/A'}</p>
                      {booking.property?.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {booking.property.address}
                        </p>
                      )}
                      {booking.property?.location && !booking.property?.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {booking.property.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="check_in_date">Check-in Date</Label>
                          <Input
                            id="check_in_date"
                            type="date"
                            value={editForm.check_in_date}
                            onChange={(e) => setEditForm({ ...editForm, check_in_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="check_out_date">Check-out Date</Label>
                          <Input
                            id="check_out_date"
                            type="date"
                            value={editForm.check_out_date}
                            onChange={(e) => setEditForm({ ...editForm, check_out_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="num_guests">Number of Guests</Label>
                        <Input
                          id="num_guests"
                          type="number"
                          min="1"
                          value={editForm.num_guests}
                          onChange={(e) => setEditForm({ ...editForm, num_guests: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check-in</p>
                          <p className="font-medium">{format(checkInDate, 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check-out</p>
                          <p className="font-medium">{format(checkOutDate, 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Special Requests */}
              {(booking.special_requests || isEditing) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Special Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="special_requests">Special Requests</Label>
                        <Textarea
                          id="special_requests"
                          placeholder="Enter any special requests or notes..."
                          value={editForm.special_requests}
                          onChange={(e) => setEditForm({ ...editForm, special_requests: e.target.value })}
                          rows={4}
                        />
                      </div>
                    ) : (
                      <p className="text-sm bg-muted/50 p-4 rounded-lg">{booking.special_requests}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Status & Payment (Edit Mode Only) */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Status & Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Booking Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="checked_in">Checked In</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select
                        value={editForm.payment_status}
                        onValueChange={(value: any) => setEditForm({ ...editForm, payment_status: value })}
                      >
                        <SelectTrigger id="payment_status">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                    <span>{formatCurrency(booking.base_amount)}</span>
                  </div>
                  {booking.cleaning_fee && booking.cleaning_fee > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cleaning fee</span>
                      <span>{formatCurrency(booking.cleaning_fee)}</span>
                    </div>
                  )}
                  {booking.discount_amount && booking.discount_amount > 0 && (
                    <div className="flex items-center justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(booking.discount_amount)}</span>
                    </div>
                  )}
                  {booking.tax_amount && booking.tax_amount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(booking.tax_amount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(booking.total_amount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {booking.status === 'confirmed' && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleCheckIn}
                      disabled={updateBookingStatus.isPending}
                    >
                      {updateBookingStatus.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Check In Guest
                    </Button>
                  )}
                  {booking.status === 'checked_in' && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={handleCheckOut}
                      disabled={updateBookingStatus.isPending}
                    >
                      {updateBookingStatus.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete Check-out
                    </Button>
                  )}
                  <Button className="w-full justify-start" variant="outline" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                  <Button className="w-full justify-start" variant="outline" disabled>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule Booking
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

export default BookingDetails;
