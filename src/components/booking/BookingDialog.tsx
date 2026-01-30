import { useState, useEffect } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, Users, Loader2, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { checkAvailability, calculateBookingPrice, useCreateBooking } from '@/hooks/useBookings';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
}

type BookingStep = 'dates' | 'guest-info' | 'review' | 'success';

interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface PriceBreakdown {
  baseAmount: number;
  cleaningFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  nights: number;
}

export const BookingDialog = ({ open, onOpenChange, property }: BookingDialogProps) => {
  const [step, setStep] = useState<BookingStep>('dates');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [numGuests, setNumGuests] = useState(1);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [bookingNumber, setBookingNumber] = useState<string | null>(null);

  const createBooking = useCreateBooking();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('dates');
        setCheckIn(undefined);
        setCheckOut(undefined);
        setNumGuests(1);
        setGuestInfo({ fullName: '', email: '', phone: '', specialRequests: '' });
        setAvailabilityError(null);
        setPriceBreakdown(null);
        setBookingNumber(null);
      }, 300);
    }
  }, [open]);

  // Check availability and calculate price when dates change
  useEffect(() => {
    const checkAndCalculate = async () => {
      if (!checkIn || !checkOut || !property.id) return;

      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const availability = await checkAvailability({
          propertyId: property.id,
          checkInDate: format(checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(checkOut, 'yyyy-MM-dd'),
        });

        if (!availability.available) {
          setAvailabilityError('This property is not available for the selected dates. Please choose different dates.');
          setPriceBreakdown(null);
          return;
        }

        setIsCalculatingPrice(true);
        const price = await calculateBookingPrice({
          propertyId: property.id,
          checkInDate: format(checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(checkOut, 'yyyy-MM-dd'),
          numGuests,
        });
        setPriceBreakdown(price);
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailabilityError('Unable to check availability. Please try again.');
      } finally {
        setIsCheckingAvailability(false);
        setIsCalculatingPrice(false);
      }
    };

    checkAndCalculate();
  }, [checkIn, checkOut, property.id, numGuests]);

  const handleDateSelect = (date: Date | undefined, type: 'checkIn' | 'checkOut') => {
    if (type === 'checkIn') {
      setCheckIn(date);
      // Auto-set checkout to next day if not set or if it's before new checkin
      if (date && (!checkOut || checkOut <= date)) {
        setCheckOut(addDays(date, 1));
      }
    } else {
      setCheckOut(date);
    }
  };

  const handleNextStep = () => {
    if (step === 'dates') setStep('guest-info');
    else if (step === 'guest-info') setStep('review');
  };

  const handlePreviousStep = () => {
    if (step === 'guest-info') setStep('dates');
    else if (step === 'review') setStep('guest-info');
  };

  const handleConfirmBooking = async () => {
    if (!checkIn || !checkOut || !priceBreakdown) return;

    try {
      // First, check if customer exists or create new one
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', guestInfo.email)
        .maybeSingle();

      let customerId: string;

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            full_name: guestInfo.fullName,
            email: guestInfo.email,
            phone: guestInfo.phone,
          })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          throw new Error('Failed to create customer record');
        }
        customerId = newCustomer.id;
      }

      // Create booking
      const booking = await createBooking.mutateAsync({
        property_id: property.id,
        customer_id: customerId,
        check_in_date: format(checkIn, 'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        num_guests: numGuests,
        base_amount: priceBreakdown.baseAmount,
        cleaning_fee: priceBreakdown.cleaningFee,
        tax_amount: priceBreakdown.taxAmount,
        discount_amount: priceBreakdown.discountAmount,
        total_amount: priceBreakdown.totalAmount,
        special_requests: guestInfo.specialRequests || undefined,
        booked_via: 'website',
        source: 'direct',
        status: 'pending',
        payment_status: 'pending',
      });

      setBookingNumber(booking.booking_number);
      setStep('success');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canProceedFromDates = checkIn && checkOut && !availabilityError && priceBreakdown && !isCheckingAvailability;
  const canProceedFromGuestInfo = guestInfo.fullName && guestInfo.email && guestInfo.phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto [&_.rdp]:overflow-visible">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 'dates' && 'Select Your Dates'}
            {step === 'guest-info' && 'Guest Information'}
            {step === 'review' && 'Review Your Booking'}
            {step === 'success' && 'Booking Confirmed!'}
          </DialogTitle>
          <DialogDescription>
            {step !== 'success' && property.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Dates */}
        {step === 'dates' && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !checkIn && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="bottom" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={(date) => handleDateSelect(date, 'checkIn')}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !checkOut && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="bottom" sideOffset={4}>
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={(date) => handleDateSelect(date, 'checkOut')}
                      disabled={(date) => date <= (checkIn || new Date())}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Number of Guests</Label>
              <Select value={String(numGuests)} onValueChange={(v) => setNumGuests(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availabilityError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {availabilityError}
              </div>
            )}

            {isCheckingAvailability && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking availability...
              </div>
            )}

            {priceBreakdown && !availabilityError && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(property.base_price_per_night)} × {priceBreakdown.nights} nights
                  </span>
                  <span>{formatCurrency(priceBreakdown.baseAmount)}</span>
                </div>
                {priceBreakdown.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span>{formatCurrency(priceBreakdown.cleaningFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span>{formatCurrency(priceBreakdown.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(priceBreakdown.totalAmount)}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleNextStep}
              disabled={!canProceedFromDates}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step: Guest Info */}
        {step === 'guest-info' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={guestInfo.fullName}
                onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={guestInfo.specialRequests}
                onChange={(e) => setGuestInfo({ ...guestInfo, specialRequests: e.target.value })}
                placeholder="Any special requests or notes for your stay..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleNextStep}
                disabled={!canProceedFromGuestInfo}
              >
                Review Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && priceBreakdown && checkIn && checkOut && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Property
                </h4>
                <p className="font-medium">{property.name}</p>
                <p className="text-sm text-muted-foreground">{property.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Check-in
                  </h4>
                  <p className="font-medium">{format(checkIn, 'EEE, MMM d, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Check-out
                  </h4>
                  <p className="font-medium">{format(checkOut, 'EEE, MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Guests
                </h4>
                <p className="font-medium">{numGuests} {numGuests === 1 ? 'Guest' : 'Guests'}</p>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Guest Details
              </h4>
              <p className="font-medium">{guestInfo.fullName}</p>
              <p className="text-sm text-muted-foreground">{guestInfo.email}</p>
              <p className="text-sm text-muted-foreground">{guestInfo.phone}</p>
              {guestInfo.specialRequests && (
                <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                  <span className="font-medium">Notes:</span> {guestInfo.specialRequests}
                </p>
              )}
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(property.base_price_per_night)} × {priceBreakdown.nights} nights
                </span>
                <span>{formatCurrency(priceBreakdown.baseAmount)}</span>
              </div>
              {priceBreakdown.cleaningFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cleaning fee</span>
                  <span>{formatCurrency(priceBreakdown.cleaningFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span>{formatCurrency(priceBreakdown.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t text-lg">
                <span>Total</span>
                <span>{formatCurrency(priceBreakdown.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmBooking}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your reservation has been successfully created.
              </p>
            </div>

            {bookingNumber && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="text-2xl font-bold font-mono">{bookingNumber}</p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to <strong>{guestInfo.email}</strong>
            </p>

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
