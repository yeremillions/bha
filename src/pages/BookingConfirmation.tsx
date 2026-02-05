import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Check, Home, Calendar, MapPin, Users, CreditCard, Mail, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

interface BookingDetails {
  id: string;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_amount: number;
  status: string;
  payment_status: string;
  special_requests: string | null;
  property: {
    id: string;
    name: string;
    address: string;
    location: string;
    images: string[] | null;
  };
  customer: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export default function BookingConfirmation() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only show confirmation when booking data was passed via navigation state
    // (i.e., user just completed a payment). This prevents unauthorized access
    // to guest details by guessing booking numbers in the URL.
    const stateBooking = (location.state as any)?.booking;
    if (stateBooking) {
      setBooking(stateBooking as BookingDetails);
      setLoading(false);
      return;
    }

    // No navigation state — redirect to Manage Booking where the user
    // must verify their identity with email + booking reference.
    navigate('/manage-booking', { replace: true });
  }, [bookingNumber, location.state, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const checkInDate = booking ? new Date(booking.check_in_date) : null;
  const checkOutDate = booking ? new Date(booking.check_out_date) : null;
  const nights = checkInDate && checkOutDate
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-background pt-20">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Loading booking details...</div>
          </div>
        ) : error || !booking ? (
          <div className="flex items-center justify-center py-20">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
                <p className="text-muted-foreground mb-4">{error || 'Unable to find your booking'}</p>
                <Button onClick={() => navigate('/')}>
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
        <>
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your booking. A confirmation email has been sent to {booking.customer.email}
          </p>
        </div>

        {/* Booking Reference */}
        <Card className="mb-6 border-2 border-accent/30 bg-accent/5">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="font-display text-3xl font-bold text-accent">{booking.booking_number}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please save this number to manage your booking
            </p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Property Info */}
            <div className="flex gap-4 mb-6">
              {booking.property.images?.[0] && (
                <img
                  src={booking.property.images[0]}
                  alt={booking.property.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <h2 className="font-display text-xl font-semibold">{booking.property.name}</h2>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {booking.property.address ? `${booking.property.address}, ` : ''}{booking.property.location}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Stay Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Check-in
                </p>
                <p className="font-semibold">{format(checkInDate, 'EEE, MMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">From 2:00 PM</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Check-out
                </p>
                <p className="font-semibold">{format(checkOutDate, 'EEE, MMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">By 11:00 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                {booking.num_guests} {booking.num_guests === 1 ? 'Guest' : 'Guests'}
              </span>
              <span className="text-muted-foreground">|</span>
              <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>

            <Separator className="my-4" />

            {/* Guest Info */}
            <div className="space-y-2">
              <h3 className="font-semibold">Guest Information</h3>
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {booking.customer.full_name}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {booking.customer.email}
              </p>
              {booking.customer.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {booking.customer.phone}
                </p>
              )}
            </div>

            {booking.special_requests && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold mb-1">Special Requests</h3>
                  <p className="text-muted-foreground">{booking.special_requests}</p>
                </div>
              </>
            )}

            <Separator className="my-4" />

            {/* Payment Info */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Total Paid
                </p>
                <p className="font-display text-2xl font-bold">{formatCurrency(booking.total_amount)}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/manage-booking', { state: { email: booking.customer.email, bookingNumber: booking.booking_number, booking } })}
            className="flex-1"
            size="lg"
          >
            Manage Booking
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </div>

        </>
        )}
      </main>

      <Footer />
    </div>
  );
}
