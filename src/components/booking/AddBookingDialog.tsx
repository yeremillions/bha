import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Users, Loader2, Check, AlertCircle, Building2 } from 'lucide-react';
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
import { useProperties } from '@/hooks/useProperties';
import { checkAvailability, calculateBookingPrice, useCreateBooking } from '@/hooks/useBookings';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = 'property' | 'dates' | 'guest-info' | 'review' | 'success';

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

export const AddBookingDialog = ({ open, onOpenChange }: AddBookingDialogProps) => {
  const [step, setStep] = useState<BookingStep>('property');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial' | 'reserve'>('full');
  const [depositAmount, setDepositAmount] = useState<number>(0);

  const { data: properties = [], isLoading: propertiesLoading } = useProperties({ status: 'available' });
  const createBooking = useCreateBooking();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('property');
        setSelectedProperty(null);
        setCheckIn(undefined);
        setCheckOut(undefined);
        setNumGuests(1);
        setGuestInfo({ fullName: '', email: '', phone: '', specialRequests: '' });
        setAvailabilityError(null);
        setPriceBreakdown(null);
        setBookingNumber(null);
        setPaymentOption('full');
        setDepositAmount(0);
      }, 300);
    }
  }, [open]);

  // Calculate default 30% deposit when price changes
  useEffect(() => {
    if (priceBreakdown) {
      const defaultDeposit = Math.round(priceBreakdown.totalAmount * 0.3);
      setDepositAmount(defaultDeposit);
    }
  }, [priceBreakdown]);

  // Check availability and calculate price when dates change
  useEffect(() => {
    const checkAndCalculate = async () => {
      if (!checkIn || !checkOut || !selectedProperty?.id) return;

      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const availability = await checkAvailability({
          propertyId: selectedProperty.id,
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
          propertyId: selectedProperty.id,
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
  }, [checkIn, checkOut, selectedProperty?.id, numGuests]);

  const handleDateSelect = (date: Date | undefined, type: 'checkIn' | 'checkOut') => {
    if (type === 'checkIn') {
      setCheckIn(date);
      if (date && (!checkOut || checkOut <= date)) {
        setCheckOut(addDays(date, 1));
      }
    } else {
      setCheckOut(date);
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setNumGuests(1);
    }
  };

  const handleNextStep = () => {
    if (step === 'property') setStep('dates');
    else if (step === 'dates') setStep('guest-info');
    else if (step === 'guest-info') setStep('review');
  };

  const handlePreviousStep = () => {
    if (step === 'dates') setStep('property');
    else if (step === 'guest-info') setStep('dates');
    else if (step === 'review') setStep('guest-info');
  };

  const handleConfirmBooking = async () => {
    if (!checkIn || !checkOut || !priceBreakdown || !selectedProperty) return;

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
        // Update customer info if they exist
        await supabase
          .from('customers')
          .update({
            full_name: guestInfo.fullName,
            phone: guestInfo.phone,
          })
          .eq('id', customerId);
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

      // Determine payment and approval status based on payment option
      let paymentStatus: 'paid' | 'partial' | 'pending' = 'pending';
      let approvalStatus: 'approved' | 'pending' = 'approved';
      let bookingStatus: 'confirmed' | 'pending' = 'confirmed';
      let amountPaid = 0;

      if (paymentOption === 'full') {
        paymentStatus = 'paid';
        amountPaid = priceBreakdown.totalAmount;
        approvalStatus = 'approved';
        bookingStatus = 'confirmed';
      } else if (paymentOption === 'partial') {
        paymentStatus = 'partial';
        amountPaid = depositAmount;
        approvalStatus = 'approved';
        bookingStatus = 'confirmed';
      } else if (paymentOption === 'reserve') {
        paymentStatus = 'pending';
        amountPaid = 0;
        approvalStatus = 'pending'; // Needs manager approval
        bookingStatus = 'pending';
      }

      // Create booking via dashboard for walk-in guest
      const booking = await createBooking.mutateAsync({
        property_id: selectedProperty.id,
        customer_id: customerId,
        check_in_date: format(checkIn, 'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        num_guests: numGuests,
        base_amount: priceBreakdown.baseAmount,
        cleaning_fee: priceBreakdown.cleaningFee,
        tax_amount: priceBreakdown.taxAmount,
        discount_amount: priceBreakdown.discountAmount,
        total_amount: priceBreakdown.totalAmount,
        amount_paid: amountPaid,
        special_requests: guestInfo.specialRequests || undefined,
        booked_via: 'dashboard',
        source: 'walk_in',
        status: bookingStatus,
        payment_status: paymentStatus,
        approval_status: approvalStatus,
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

  const canProceedFromProperty = selectedProperty !== null;
  const canProceedFromDates = checkIn && checkOut && !availabilityError && priceBreakdown && !isCheckingAvailability;
  const canProceedFromGuestInfo = guestInfo.fullName && guestInfo.email && guestInfo.phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto [&_.rdp]:overflow-visible">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 'property' && 'Select Property'}
            {step === 'dates' && 'Select Dates'}
            {step === 'guest-info' && 'Guest Information'}
            {step === 'review' && 'Review Booking'}
            {step === 'success' && 'Booking Created!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'property' && 'Choose a property for the walk-in guest'}
            {step === 'dates' && selectedProperty?.name}
            {step === 'guest-info' && selectedProperty?.name}
            {step === 'review' && 'Confirm the booking details'}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Property Selection */}
        {step === 'property' && (
          <div className="space-y-4 py-4">
            {propertiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No available properties found.
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Property</Label>
                <Select value={selectedProperty?.id || ''} onValueChange={handlePropertySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{property.name}</span>
                          <span className="text-muted-foreground">• {property.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProperty && (
                  <div className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-2">
                    <h4 className="font-semibold">{selectedProperty.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedProperty.location}</p>
                    <div className="flex gap-4 text-sm">
                      <span>{selectedProperty.bedrooms} Bedrooms</span>
                      <span>{selectedProperty.bathrooms} Bathrooms</span>
                      <span>Max {selectedProperty.max_guests} Guests</span>
                    </div>
                    <p className="text-lg font-semibold text-accent">
                      {formatCurrency(selectedProperty.base_price_per_night)}/night
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleNextStep}
              disabled={!canProceedFromProperty}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step: Dates */}
        {step === 'dates' && selectedProperty && (
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                  {Array.from({ length: selectedProperty.max_guests }, (_, i) => i + 1).map((num) => (
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
                    {formatCurrency(selectedProperty.base_price_per_night)} × {priceBreakdown.nights} nights
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

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleNextStep}
                disabled={!canProceedFromDates}
              >
                Continue
              </Button>
            </div>
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
                placeholder="Any special requests or notes for the stay..."
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
        {step === 'review' && priceBreakdown && checkIn && checkOut && selectedProperty && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Property
                </h4>
                <p className="font-medium">{selectedProperty.name}</p>
                <p className="text-sm text-muted-foreground">{selectedProperty.location}</p>
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

            {/* Payment Options */}
            <div className="rounded-lg border p-4 space-y-4 bg-accent/5">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Payment Option
              </h4>
              <Select value={paymentOption} onValueChange={(value: 'full' | 'partial' | 'reserve') => setPaymentOption(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    <div className="flex flex-col">
                      <span className="font-medium">Full Payment</span>
                      <span className="text-xs text-muted-foreground">Customer pays {formatCurrency(priceBreakdown.totalAmount)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="partial">
                    <div className="flex flex-col">
                      <span className="font-medium">Partial Payment (Deposit)</span>
                      <span className="text-xs text-muted-foreground">Default 30% deposit - customizable</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reserve">
                    <div className="flex flex-col">
                      <span className="font-medium">Reserve Without Payment</span>
                      <span className="text-xs text-muted-foreground text-amber-600 dark:text-amber-400">Requires manager approval</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {paymentOption === 'partial' && (
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Deposit Amount</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min="0"
                    max={priceBreakdown.totalAmount}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    placeholder="Enter deposit amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    Balance due: {formatCurrency(priceBreakdown.totalAmount - depositAmount)}
                  </p>
                </div>
              )}

              {paymentOption === 'reserve' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-600 dark:text-amber-400">
                    This booking will be marked as <strong>Pending Approval</strong> and will require facility manager review before confirmation.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(selectedProperty.base_price_per_night)} × {priceBreakdown.nights} nights
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
                <span className="text-accent">{formatCurrency(priceBreakdown.totalAmount)}</span>
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
                    Creating...
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

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Booking Created Successfully!</h3>
              <p className="text-muted-foreground">
                The walk-in booking has been confirmed.
              </p>
            </div>

            {bookingNumber && (
              <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Booking Reference</p>
                <p className="text-lg font-mono font-semibold">{bookingNumber}</p>
              </div>
            )}

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
