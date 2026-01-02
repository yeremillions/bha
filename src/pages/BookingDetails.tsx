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
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

// Mock booking data - in production this would come from an API
const mockBookings = [
  {
    id: 'BK-001',
    guestName: 'Ibrahim Musa',
    guestEmail: 'ibrahim.musa@email.com',
    guestPhone: '+234 801 234 5678',
    property: 'Oceanview Suite',
    propertyAddress: '123 Beachfront Drive, Lagos',
    checkIn: new Date(2026, 0, 5),
    checkOut: new Date(2026, 0, 10),
    guests: 2,
    amount: 125000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    bookingDate: new Date(2025, 11, 20),
    specialRequests: 'Late check-in requested (around 10 PM). Would appreciate a room with ocean view.',
    notes: 'Returning guest - 3rd booking',
  },
  {
    id: 'BK-002',
    guestName: 'Amina Bello',
    guestEmail: 'amina.bello@email.com',
    guestPhone: '+234 802 345 6789',
    property: 'Garden Villa',
    propertyAddress: '45 Palm Gardens, Abuja',
    checkIn: new Date(2026, 0, 8),
    checkOut: new Date(2026, 0, 12),
    guests: 4,
    amount: 180000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'Bank Transfer',
    bookingDate: new Date(2025, 11, 28),
    specialRequests: 'Need extra bedding for children.',
    notes: '',
  },
  {
    id: 'BK-003',
    guestName: 'Chukwuma Obi',
    guestEmail: 'chukwuma.obi@email.com',
    guestPhone: '+234 803 456 7890',
    property: 'City Penthouse',
    propertyAddress: '78 Victoria Island, Lagos',
    checkIn: new Date(2026, 0, 15),
    checkOut: new Date(2026, 0, 18),
    guests: 2,
    amount: 210000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    bookingDate: new Date(2026, 0, 1),
    specialRequests: '',
    notes: 'VIP guest - Corporate booking',
  },
  {
    id: 'BK-004',
    guestName: 'Fatima Yusuf',
    guestEmail: 'fatima.yusuf@email.com',
    guestPhone: '+234 804 567 8901',
    property: 'Oceanview Suite',
    propertyAddress: '123 Beachfront Drive, Lagos',
    checkIn: new Date(2026, 0, 12),
    checkOut: new Date(2026, 0, 14),
    guests: 1,
    amount: 75000,
    status: 'checked-in',
    paymentStatus: 'paid',
    paymentMethod: 'Debit Card',
    bookingDate: new Date(2026, 0, 2),
    specialRequests: 'Quiet room preferred.',
    notes: '',
  },
  {
    id: 'BK-005',
    guestName: 'Emmanuel Adeyemi',
    guestEmail: 'emmanuel.adeyemi@email.com',
    guestPhone: '+234 805 678 9012',
    property: 'Garden Villa',
    propertyAddress: '45 Palm Gardens, Abuja',
    checkIn: new Date(2026, 0, 20),
    checkOut: new Date(2026, 0, 25),
    guests: 3,
    amount: 225000,
    status: 'confirmed',
    paymentStatus: 'partial',
    paymentMethod: 'Bank Transfer',
    bookingDate: new Date(2026, 0, 3),
    specialRequests: 'Anniversary celebration - please arrange flowers.',
    notes: '50% deposit paid',
  },
];

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

  const booking = mockBookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="min-h-screen flex bg-background">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <XCircle className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Booking Not Found</h2>
              <p className="text-muted-foreground">The booking you're looking for doesn't exist.</p>
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

  const nights = differenceInDays(booking.checkOut, booking.checkIn);
  const pricePerNight = booking.amount / nights;

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        <AdminHeader />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/bookings')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{booking.id}</h1>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Booked on {format(booking.bookingDate, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Guest
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
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
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{booking.guestName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{booking.guestEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{booking.guestPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
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
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{booking.property}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {booking.propertyAddress}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in</p>
                        <p className="font-medium">{format(booking.checkIn, 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-out</p>
                        <p className="font-medium">{format(booking.checkOut, 'MMM d, yyyy')}</p>
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
                </CardContent>
              </Card>

              {/* Special Requests & Notes */}
              {(booking.specialRequests || booking.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Special Requests & Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {booking.specialRequests && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg">{booking.specialRequests}</p>
                      </div>
                    )}
                    {booking.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                        <p className="text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">{booking.notes}</p>
                      </div>
                    )}
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
                    <Badge variant="outline" className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">{booking.paymentMethod}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">₦{pricePerNight.toLocaleString()} × {nights} nights</span>
                    <span>₦{booking.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>₦0</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{booking.amount.toLocaleString()}</span>
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
                    <Button className="w-full justify-start" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Check-in
                    </Button>
                  )}
                  {booking.status === 'checked-in' && (
                    <Button className="w-full justify-start" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Check-out
                    </Button>
                  )}
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Invoice
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
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
