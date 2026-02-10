import { supabase } from '@/integrations/supabase/client';

/**
 * Send email via the send-booking-email edge function.
 * All email rendering and delivery happens server-side - no API keys in the client.
 */
async function invokeEmailFunction(
  bookingId: string,
  emailType: 'confirmation' | 'cancellation' | 'payment_receipt' | 'check_in_reminder',
  additionalData?: Record<string, unknown>
): Promise<{ success: boolean; error?: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-booking-email', {
      body: { bookingId, emailType, additionalData },
    });

    if (error) {
      console.error(`Error sending ${emailType} email:`, error.message);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error(`Error invoking send-booking-email:`, error);
    return { success: false, error };
  }
}

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (
  _customerEmail: string,
  bookingData: {
    bookingId?: string;
    bookingNumber: string;
    customerName: string;
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    guestCount: number;
  }
) => {
  if (!bookingData.bookingId) {
    // Fallback: look up booking by number
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_number', bookingData.bookingNumber)
      .single();
    if (!data) return { success: false, error: new Error('Booking not found') };
    bookingData.bookingId = data.id;
  }
  return invokeEmailFunction(bookingData.bookingId, 'confirmation');
};

/**
 * Send payment receipt email
 */
export const sendPaymentReceipt = async (
  _customerEmail: string,
  paymentData: {
    bookingId?: string;
    bookingNumber: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    transactionRef: string;
    date: string;
  }
) => {
  if (!paymentData.bookingId) {
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_number', paymentData.bookingNumber)
      .single();
    if (!data) return { success: false, error: new Error('Booking not found') };
    paymentData.bookingId = data.id;
  }
  return invokeEmailFunction(paymentData.bookingId, 'payment_receipt', {
    transactionRef: paymentData.transactionRef,
  });
};

/**
 * Send check-in reminder email
 */
export const sendCheckInReminder = async (
  _customerEmail: string,
  reminderData: {
    bookingId?: string;
    customerName: string;
    bookingNumber: string;
    propertyName: string;
    checkInDate: string;
    checkInTime: string;
    propertyAddress: string;
  }
) => {
  if (!reminderData.bookingId) {
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_number', reminderData.bookingNumber)
      .single();
    if (!data) return { success: false, error: new Error('Booking not found') };
    reminderData.bookingId = data.id;
  }
  return invokeEmailFunction(reminderData.bookingId, 'check_in_reminder');
};

/**
 * Send cancellation confirmation email
 */
export const sendCancellationConfirmation = async (
  _customerEmail: string,
  cancellationData: {
    bookingId?: string;
    bookingNumber: string;
    customerName: string;
    propertyName: string;
    refundAmount: number;
    cancellationDate: string;
  }
) => {
  if (!cancellationData.bookingId) {
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_number', cancellationData.bookingNumber)
      .single();
    if (!data) return { success: false, error: new Error('Booking not found') };
    cancellationData.bookingId = data.id;
  }
  return invokeEmailFunction(cancellationData.bookingId, 'cancellation', {
    refundAmount: cancellationData.refundAmount,
    refundMessage: `Refund of ${cancellationData.refundAmount} will be processed within 5-7 business days.`,
  });
};
