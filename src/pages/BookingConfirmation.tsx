import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Check, Home, Calendar, MapPin, Users, CreditCard, Mail, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

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
    city: string;
    featured_image: string | null;
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
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingNumber) {
        setError('Booking number not provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_number,
            check_in_date,
            check_out_date,
            num_guests,
            total_amount,
            status,
            payment_status,
            special_requests,
            property:properties (
              id,
              name,
              address,
              city,
              featured_image
            ),
            customer:customers (
              full_name,
              email,
              phone
            )
          `)
          .eq('booking_number', bookingNumber)
          .single();

        if (fetchError) {
          console.error('Error fetching booking:', fetchError);
          setError('Booking not found');
          return;
        }

        setBooking(data as unknown as BookingDetails);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingNumber]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    );
  }

  const checkInDate = new Date(booking.check_in_date);
  const checkOutDate = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-display text-2xl font-bold text-primary">
            BHA
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
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
              {booking.property.featured_image && (
                <img
                  src={booking.property.featured_image}
                  alt={booking.property.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <h2 className="font-display text-xl font-semibold">{booking.property.name}</h2>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {booking.property.address}, {booking.property.city}
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
            onClick={() => navigate('/manage-booking', { state: { email: booking.customer.email, bookingNumber: booking.booking_number } })}
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

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Need help? Contact us at{' '}
          <a href="mailto:support@bha.com" className="text-accent hover:underline">
            support@bha.com
          </a>
        </p>
      </main>
    </div>
  );
}
