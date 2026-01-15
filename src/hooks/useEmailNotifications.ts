import { useMutation } from '@tanstack/react-query';
import {
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendCheckInReminder,
  sendCancellationConfirmation,
} from '@/lib/emailService';
import { toast } from 'sonner';

/**
 * Hook to send booking confirmation email
 */
export const useSendBookingConfirmation = () => {
  return useMutation({
    mutationFn: async (data: {
      customerEmail: string;
      bookingNumber: string;
      customerName: string;
      propertyName: string;
      checkInDate: string;
      checkOutDate: string;
      totalPrice: number;
      guestCount: number;
    }) => {
      const result = await sendBookingConfirmation(data.customerEmail, data);
      if (!result.success) {
        throw new Error('Failed to send booking confirmation email');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Booking confirmation email sent successfully');
    },
    onError: (error: any) => {
      console.error('Error sending booking confirmation:', error);
      toast.error('Failed to send booking confirmation email');
    },
  });
};

/**
 * Hook to send payment receipt email
 */
export const useSendPaymentReceipt = () => {
  return useMutation({
    mutationFn: async (data: {
      customerEmail: string;
      bookingNumber: string;
      customerName: string;
      amount: number;
      paymentMethod: string;
      transactionRef: string;
      date: string;
    }) => {
      const result = await sendPaymentReceipt(data.customerEmail, data);
      if (!result.success) {
        throw new Error('Failed to send payment receipt email');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Payment receipt email sent successfully');
    },
    onError: (error: any) => {
      console.error('Error sending payment receipt:', error);
      toast.error('Failed to send payment receipt email');
    },
  });
};

/**
 * Hook to send check-in reminder email
 */
export const useSendCheckInReminder = () => {
  return useMutation({
    mutationFn: async (data: {
      customerEmail: string;
      customerName: string;
      bookingNumber: string;
      propertyName: string;
      checkInDate: string;
      checkInTime: string;
      propertyAddress: string;
    }) => {
      const result = await sendCheckInReminder(data.customerEmail, data);
      if (!result.success) {
        throw new Error('Failed to send check-in reminder email');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Check-in reminder email sent successfully');
    },
    onError: (error: any) => {
      console.error('Error sending check-in reminder:', error);
      toast.error('Failed to send check-in reminder email');
    },
  });
};

/**
 * Hook to send cancellation confirmation email
 */
export const useSendCancellationConfirmation = () => {
  return useMutation({
    mutationFn: async (data: {
      customerEmail: string;
      bookingNumber: string;
      customerName: string;
      propertyName: string;
      refundAmount: number;
      cancellationDate: string;
    }) => {
      const result = await sendCancellationConfirmation(data.customerEmail, data);
      if (!result.success) {
        throw new Error('Failed to send cancellation confirmation email');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Cancellation confirmation email sent successfully');
    },
    onError: (error: any) => {
      console.error('Error sending cancellation confirmation:', error);
      toast.error('Failed to send cancellation confirmation email');
    },
  });
};
