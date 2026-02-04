import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Calendar, MapPin, Users, CreditCard, Mail, Phone, Home, ArrowLeft, AlertCircle, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface BookingDetails {
  id: string;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_amount: number;
  base_amount: number;
  cleaning_fee: number;
  tax_amount: number;
  status: string;
  payment_status: string;
  special_requests: string | null;
  created_at: string;
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

export default function ManageBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Pre-fill from navigation state if coming from confirmation page
  useEffect(() => {
    if (location.state?.email && location.state?.bookingNumber) {
      setEmail(location.state.email);
      setBookingNumber(location.state.bookingNumber);
      // Auto-search if we have both values
      handleSearch(location.state.email, location.state.bookingNumber);
    }
  }, [location.state]);

  const handleSearch = async (searchEmail?: string, searchBookingNumber?: string) => {
    const emailToSearch = searchEmail || email;
    const bookingToSearch = searchBookingNumber || bookingNumber;

    if (!emailToSearch || !bookingToSearch) {
      setError('Please enter both email and booking number');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

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
          base_amount,
          cleaning_fee,
          tax_amount,
          status,
          payment_status,
          special_requests,
          created_at,
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
        .eq('booking_number', bookingToSearch.toUpperCase())
        .single();

      if (fetchError || !data) {
        setError('Booking not found. Please check your booking number and email.');
        setBooking(null);
        return;
      }

      // Verify email matches
      const bookingData = data as unknown as BookingDetails;
      if (bookingData.customer.email.toLowerCase() !== emailToSearch.toLowerCase()) {
        setError('The email address does not match our records for this booking.');
        setBooking(null);
        return;
      }

      setBooking(bookingData);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to look up booking. Please try again.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      confirmed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-400', icon: <Check className="h-3 w-3" /> },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: <Clock className="h-3 w-3" /> },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: <AlertCircle className="h-3 w-3" /> },
      completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', icon: <Check className="h-3 w-3" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-display text-2xl font-bold text-primary">
            BHA
          </Link>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Manage Your Booking</h1>
          <p className="text-muted-foreground">
            Enter your email and booking number to view and manage your reservation
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Find Your Booking</CardTitle>
            <CardDescription>
              Use the details from your confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingNumber">Booking Number</Label>
                  <Input
                    id="bookingNumber"
                    type="text"
                    placeholder="BK-XXXXXX"
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Booking
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Booking Details */}
        {booking && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Booking {booking.booking_number}</CardTitle>
                  <CardDescription>
                    Booked on {format(new Date(booking.created_at), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Info */}
              <div className="flex gap-4">
                {booking.property.featured_image && (
                  <img
                    src={booking.property.featured_image}
                    alt={booking.property.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-display text-xl font-semibold">{booking.property.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {booking.property.address}, {booking.property.city}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Stay Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Check-in
                  </p>
                  <p className="font-semibold">{format(new Date(booking.check_in_date), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">From 2:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Check-out
                  </p>
                  <p className="font-semibold">{format(new Date(booking.check_out_date), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">By 11:00 AM</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {booking.num_guests} {booking.num_guests === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>

              <Separator />

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
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-1">Special Requests</h3>
                    <p className="text-muted-foreground">{booking.special_requests}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Accommodation</span>
                    <span>{formatCurrency(booking.base_amount)}</span>
                  </div>
                  {booking.cleaning_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cleaning Fee</span>
                      <span>{formatCurrency(booking.cleaning_fee)}</span>
                    </div>
                  )}
                  {booking.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes</span>
                      <span>{formatCurrency(booking.tax_amount)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">{formatCurrency(booking.total_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      Payment Status
                    </span>
                    <span className={`font-medium ${booking.payment_status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                      {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searched && !booking && !error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No booking found with those details.</p>
            </CardContent>
          </Card>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
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
