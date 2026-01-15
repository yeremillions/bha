import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  initializePayment,
  verifyPayment,
  processCompletedPayment,
  generatePaymentReference,
  type PaystackConfig,
} from '@/lib/paystackService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize a Paystack payment
 *
 * Usage:
 * const { mutate: initPayment, isPending } = useInitializePayment();
 * initPayment({ email, amount, metadata: { booking_id, property_id } });
 */
export const useInitializePayment = () => {
  return useMutation({
    mutationFn: async (config: PaystackConfig) => {
      const result = await initializePayment(config);

      if (!result.status || !result.data) {
        throw new Error(result.message || 'Failed to initialize payment');
      }

      return result.data;
    },
    onSuccess: (data) => {
      console.log('Payment initialized successfully:', data.reference);
    },
    onError: (error: any) => {
      console.error('Error initializing payment:', error);
      toast.error(error.message || 'Failed to initialize payment');
    },
  });
};

/**
 * Verify a Paystack payment
 *
 * Usage:
 * const { mutate: verify } = useVerifyPayment();
 * verify(reference);
 */
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string) => {
      const result = await verifyPayment(reference);

      if (!result.success) {
        throw new Error(result.message || 'Payment verification failed');
      }

      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Payment verified successfully');
      console.log('Payment verified:', data);
    },
    onError: (error: any) => {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Payment verification failed');
    },
  });
};

/**
 * Process a completed payment
 * Updates booking status, creates transaction record
 *
 * Usage:
 * const { mutate: processPayment } = useProcessPayment();
 * processPayment({ bookingId, propertyId, amount, reference });
 */
export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      propertyId,
      amount,
      reference,
      metadata,
    }: {
      bookingId: string;
      propertyId: string;
      amount: number;
      reference: string;
      metadata?: Record<string, any>;
    }) => {
      const result = await processCompletedPayment(
        bookingId,
        propertyId,
        amount,
        reference,
        metadata
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to process payment');
      }

      return result.booking;
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', booking?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Payment processed successfully');
      console.log('Payment processed for booking:', booking?.booking_number);
    },
    onError: (error: any) => {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Failed to process payment');
    },
  });
};

/**
 * Get payment history for a booking
 *
 * Usage:
 * const { data: payments } = useBookingPayments(bookingId);
 */
export const useBookingPayments = (bookingId?: string) => {
  return useQuery({
    queryKey: ['transactions', 'booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('transaction_type', 'income')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching booking payments:', error);
        throw error;
      }

      return data;
    },
    enabled: !!bookingId,
  });
};

/**
 * Get all payment transactions
 *
 * Usage:
 * const { data: transactions } = usePaymentTransactions();
 */
export const usePaymentTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, booking:bookings(booking_number), property:properties(name)')
        .eq('transaction_type', 'income')
        .eq('payment_method', 'paystack')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment transactions:', error);
        throw error;
      }

      return data;
    },
  });
};

/**
 * Generate a payment reference for a booking
 *
 * Usage:
 * const reference = generatePaymentReference(bookingId);
 */
export { generatePaymentReference };
