import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generatePaymentReference } from '@/lib/paystackService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Process a completed payment via Edge Function
 * Securely verifies payment with Paystack and updates booking
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
      metadata?: Record<string, unknown>;
    }) => {
      console.log('Processing payment via Edge Function:', { bookingId, reference });

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          reference,
          bookingId,
          propertyId,
          amount,
          metadata,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to verify payment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment verification failed');
      }

      // Log warning if transaction creation had issues
      if (data?.warning) {
        console.warn('Payment warning:', data.warning);
      }

      return { booking: data.booking, warning: data.warning };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', result?.booking?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Payment processed successfully');
      if (result?.warning) {
        toast.warning(result.warning);
      }
      console.log('Payment processed for booking:', result?.booking?.booking_number);
    },
    onError: (error: Error) => {
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
        .eq('transaction_type', 'booking')
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
        .eq('transaction_type', 'booking')
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
