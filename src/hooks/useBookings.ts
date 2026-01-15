import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import {
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendCancellationConfirmation
} from '@/lib/emailService';
import { format } from 'date-fns';

// Types
export type Booking = Tables<'bookings'>;
export type BookingWithDetails = Booking & {
  property: Tables<'properties'> | null;
  customer: Tables<'customers'> | null;
};

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial';

export interface BookingFilters {
  status?: BookingStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  search?: string;
  propertyId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface NewBooking {
  property_id: string;
  customer_id: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  guest_names?: string[];
  base_amount: number;
  cleaning_fee?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  special_requests?: string;
  arrival_time?: string;
  booked_via?: string;
  source?: string;
  payment_status?: PaymentStatus;
  status?: BookingStatus;
  booking_number?: string;
}

export interface UpdateBooking {
  check_in_date?: string;
  check_out_date?: string;
  num_guests?: number;
  guest_names?: string[];
  base_amount?: number;
  cleaning_fee?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  special_requests?: string;
  arrival_time?: string;
  payment_status?: PaymentStatus;
  status?: BookingStatus;
}

export interface AvailabilityCheck {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  excludeBookingId?: string;
}

export interface PriceCalculation {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  discountAmount?: number;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch all bookings with optional filters
 * Includes property and customer details
 */
export const useBookings = (filters?: BookingFilters) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
        query = query.eq('payment_status', filters.paymentStatus);
      }
      if (filters?.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.search) {
        query = query.or(`booking_number.ilike.%${filters.search}%,special_requests.ilike.%${filters.search}%`);
      }
      if (filters?.startDate) {
        query = query.gte('check_in_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('check_out_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw new Error(`Failed to fetch bookings: ${error.message}`);
      }

      return data as BookingWithDetails[];
    },
  });
};

/**
 * Fetch a single booking by ID with full details
 */
export const useBooking = (id: string | undefined) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!id) throw new Error('Booking ID is required');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
        throw new Error(`Failed to fetch booking: ${error.message}`);
      }

      return data as BookingWithDetails;
    },
    enabled: !!id,
  });
};

/**
 * Fetch bookings by booking number
 */
export const useBookingByNumber = (bookingNumber: string | undefined) => {
  return useQuery({
    queryKey: ['booking', 'number', bookingNumber],
    queryFn: async () => {
      if (!bookingNumber) throw new Error('Booking number is required');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .eq('booking_number', bookingNumber)
        .single();

      if (error) {
        console.error('Error fetching booking by number:', error);
        throw new Error(`Failed to fetch booking: ${error.message}`);
      }

      return data as BookingWithDetails;
    },
    enabled: !!bookingNumber,
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a property is available for given dates
 * Two bookings overlap if: booking1.check_in < booking2.check_out AND booking1.check_out > booking2.check_in
 */
export const checkAvailability = async ({
  propertyId,
  checkInDate,
  checkOutDate,
  excludeBookingId,
}: AvailabilityCheck): Promise<{ available: boolean; conflictingBookings?: Booking[] }> => {
  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .not('status', 'eq', 'cancelled')
      .lt('check_in_date', checkOutDate)   // Booking starts before new checkout
      .gt('check_out_date', checkInDate);  // Booking ends after new checkin

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking availability:', error);
      throw new Error(`Failed to check availability: ${error.message}`);
    }

    const conflictingBookings = data as Booking[];
    return {
      available: conflictingBookings.length === 0,
      conflictingBookings: conflictingBookings.length > 0 ? conflictingBookings : undefined,
    };
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    throw error;
  }
};

/**
 * Calculate booking price based on property rates and dates
 */
export const calculateBookingPrice = async ({
  propertyId,
  checkInDate,
  checkOutDate,
  numGuests,
  discountAmount = 0,
}: PriceCalculation): Promise<{
  baseAmount: number;
  cleaningFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  nights: number;
}> => {
  try {
    // Fetch property details
    const { data: property, error } = await supabase
      .from('properties')
      .select('base_price_per_night, cleaning_fee, max_guests')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      throw new Error('Property not found');
    }

    // Validate guest count
    if (numGuests > property.max_guests) {
      throw new Error(`Maximum ${property.max_guests} guests allowed for this property`);
    }

    // Calculate nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Calculate amounts
    const baseAmount = property.base_price_per_night * nights;
    const cleaningFee = property.cleaning_fee || 0;
    const subtotal = baseAmount + cleaningFee - discountAmount;

    // Tax calculation (assuming 6% tax rate - this should come from settings)
    const taxAmount = Math.round(subtotal * 0.06);
    const totalAmount = subtotal + taxAmount;

    return {
      baseAmount,
      cleaningFee,
      taxAmount,
      discountAmount,
      totalAmount,
      nights,
    };
  } catch (error) {
    console.error('Error calculating booking price:', error);
    throw error;
  }
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBooking: NewBooking) => {
      // Check availability first
      const availabilityCheck = await checkAvailability({
        propertyId: newBooking.property_id,
        checkInDate: newBooking.check_in_date,
        checkOutDate: newBooking.check_out_date,
      });

      if (!availabilityCheck.available) {
        throw new Error('Property is not available for the selected dates');
      }

      // Insert booking (booking_number will be auto-generated by trigger)
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            ...newBooking,
            booking_number: newBooking.booking_number || `BK-${Date.now()}`, // Temp, overwritten by trigger
            status: newBooking.status || 'pending',
            payment_status: newBooking.payment_status || 'pending',
          },
        ])
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw new Error(`Failed to create booking: ${error.message}`);
      }

      return data as BookingWithDetails;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Booking created',
        description: `Booking ${data.booking_number} has been created successfully.`,
      });

      // Send booking confirmation email
      if (data.customer?.email) {
        try {
          await sendBookingConfirmation(data.customer.email, {
            bookingNumber: data.booking_number,
            customerName: data.customer.name,
            propertyName: data.property?.name || 'Property',
            checkInDate: format(new Date(data.check_in_date), 'MMMM d, yyyy'),
            checkOutDate: format(new Date(data.check_out_date), 'MMMM d, yyyy'),
            totalPrice: data.total_amount,
            guestCount: data.num_guests,
          });
          console.log('Booking confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send booking confirmation email:', emailError);
          // Don't throw - email failure shouldn't break the booking flow
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating booking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update an existing booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateBooking }) => {
      // If dates are being changed, check availability
      if (updates.check_in_date || updates.check_out_date) {
        const { data: currentBooking } = await supabase
          .from('bookings')
          .select('property_id, check_in_date, check_out_date')
          .eq('id', id)
          .single();

        if (currentBooking) {
          const availabilityCheck = await checkAvailability({
            propertyId: currentBooking.property_id,
            checkInDate: updates.check_in_date || currentBooking.check_in_date,
            checkOutDate: updates.check_out_date || currentBooking.check_out_date,
            excludeBookingId: id,
          });

          if (!availabilityCheck.available) {
            throw new Error('Property is not available for the selected dates');
          }
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw new Error(`Failed to update booking: ${error.message}`);
      }

      return data as BookingWithDetails;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Booking updated',
        description: `Booking ${data.booking_number} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating booking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Cancel a booking
 * Note: This does NOT automatically refund. Payment status remains unchanged.
 * Refunds must be processed manually through the refunds workflow.
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          // Note: payment_status is NOT changed - refunds are handled separately
        })
        .eq('id', id)
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .single();

      if (error) {
        console.error('Error cancelling booking:', error);
        throw new Error(error.message || 'Failed to cancel booking');
      }

      return data as BookingWithDetails;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      // Note: Success toast is handled by the component to avoid duplicate toasts

      // Send cancellation confirmation email
      if (data.customer?.email) {
        try {
          await sendCancellationConfirmation(data.customer.email, {
            bookingNumber: data.booking_number,
            customerName: data.customer.name,
            propertyName: data.property?.name || 'Property',
            checkInDate: format(new Date(data.check_in_date), 'MMMM d, yyyy'),
            checkOutDate: format(new Date(data.check_out_date), 'MMMM d, yyyy'),
            cancellationDate: format(new Date(), 'MMMM d, yyyy'),
            refundAmount: data.payment_status === 'paid' ? data.total_amount : 0,
            refundEligible: data.payment_status === 'paid',
          });
          console.log('Cancellation confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send cancellation confirmation email:', emailError);
          // Don't throw - email failure shouldn't break the cancellation flow
        }
      }
    },
    onError: (error: Error) => {
      // Note: Error toast is handled by the component for better control
      console.error('Cancel booking mutation error:', error);
    },
  });
};

/**
 * Update booking status (pending → confirmed → checked_in → completed)
 */
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .single();

      if (error) {
        console.error('Error updating booking status:', error);
        throw new Error(`Failed to update booking status: ${error.message}`);
      }

      return data as BookingWithDetails;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      toast({
        title: 'Status updated',
        description: `Booking ${data.booking_number} is now ${data.status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update booking payment status
 */
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', id)
        .select(`
          *,
          property:properties(*),
          customer:customers(*)
        `)
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        throw new Error(`Failed to update payment status: ${error.message}`);
      }

      return data as BookingWithDetails;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      toast({
        title: 'Payment status updated',
        description: `Payment for booking ${data.booking_number} is now ${data.payment_status}.`,
      });

      // Send payment receipt email when payment is marked as paid
      if (data.payment_status === 'paid' && data.customer?.email) {
        try {
          await sendPaymentReceipt(data.customer.email, {
            bookingNumber: data.booking_number,
            customerName: data.customer.name,
            propertyName: data.property?.name || 'Property',
            checkInDate: format(new Date(data.check_in_date), 'MMMM d, yyyy'),
            checkOutDate: format(new Date(data.check_out_date), 'MMMM d, yyyy'),
            amount: data.total_amount,
            paymentMethod: 'Online Payment', // This could be enhanced to track actual payment method
            transactionDate: format(new Date(), 'MMMM d, yyyy'),
            baseAmount: data.base_amount,
            cleaningFee: data.cleaning_fee || 0,
            taxAmount: data.tax_amount || 0,
            discountAmount: data.discount_amount || 0,
          });
          console.log('Payment receipt email sent successfully');
        } catch (emailError) {
          console.error('Failed to send payment receipt email:', emailError);
          // Don't throw - email failure shouldn't break the payment update flow
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating payment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Delete a booking (use with caution - prefer cancelling instead)
 */
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').delete().eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        throw new Error(`Failed to delete booking: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Booking deleted',
        description: 'The booking has been permanently deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting booking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
