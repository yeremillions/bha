/**
 * Paystack Payment Service
 *
 * Integration with Paystack for processing payments
 * Docs: https://paystack.com/docs/
 */

import { supabase } from '@/integrations/supabase/client';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY || '';

export interface PaystackConfig {
  email: string;
  amount: number; // In kobo (NGN cents) - multiply by 100
  reference?: string;
  currency?: string;
  metadata?: Record<string, any>;
  channels?: string[];
  callback_url?: string;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference: string;
  };
}

export interface PaymentVerification {
  success: boolean;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
  message?: string;
}

/**
 * Generate a unique payment reference
 */
export const generatePaymentReference = (bookingId?: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const prefix = bookingId ? `BK${bookingId.slice(0, 8)}` : 'BHA';
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Initialize a Paystack payment
 *
 * @param config Payment configuration
 * @returns Paystack initialization response
 */
export const initializePayment = async (
  config: PaystackConfig
): Promise<PaystackResponse> => {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: config.email,
        amount: Math.round(config.amount * 100), // Convert to kobo
        reference: config.reference || generatePaymentReference(),
        currency: config.currency || 'NGN',
        metadata: config.metadata || {},
        channels: config.channels || ['card', 'bank', 'ussd', 'mobile_money'],
        callback_url: config.callback_url,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return data as PaystackResponse;
  } catch (error: any) {
    console.error('Error initializing Paystack payment:', error);
    throw new Error(error.message || 'Failed to initialize payment');
  }
};

/**
 * Verify a Paystack payment
 *
 * @param reference Payment reference
 * @returns Payment verification result
 */
export const verifyPayment = async (
  reference: string
): Promise<PaymentVerification> => {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Payment verification failed',
      };
    }

    return {
      success: data.status && data.data.status === 'success',
      data: data.data,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      message: error.message || 'Payment verification failed',
    };
  }
};

/**
 * Create a transaction record in the database
 */
export const createPaymentTransaction = async (
  bookingId: string,
  propertyId: string,
  amount: number,
  reference: string,
  metadata?: Record<string, any>
) => {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('booking_number')
      .eq('id', bookingId)
      .single();

    const { data: property } = await supabase
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single();

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        transaction_type: 'income',
        category: 'accommodation',
        amount: amount,
        payment_method: 'paystack',
        booking_id: bookingId,
        description: `Payment for booking ${booking?.booking_number || bookingId} - ${property?.name || 'Property'}`,
        payment_reference: reference,
        metadata: metadata,
        status: 'completed',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return transaction;
  } catch (error) {
    console.error('Error in createPaymentTransaction:', error);
    throw error;
  }
};

/**
 * Update booking payment status after successful payment
 */
export const updateBookingPaymentStatus = async (
  bookingId: string,
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial' = 'paid'
) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: paymentStatus === 'paid' ? 'confirmed' : undefined, // Auto-confirm on payment
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking payment status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBookingPaymentStatus:', error);
    throw error;
  }
};

/**
 * Process a completed payment
 *
 * This should be called after successful payment verification
 * Updates booking status, creates transaction, and returns updated booking
 */
export const processCompletedPayment = async (
  bookingId: string,
  propertyId: string,
  amount: number,
  reference: string,
  metadata?: Record<string, any>
) => {
  try {
    // 1. Create transaction record
    await createPaymentTransaction(bookingId, propertyId, amount, reference, metadata);

    // 2. Update booking payment status
    const updatedBooking = await updateBookingPaymentStatus(bookingId, 'paid');

    return {
      success: true,
      booking: updatedBooking,
    };
  } catch (error: any) {
    console.error('Error processing completed payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to process payment',
    };
  }
};

/**
 * Get Paystack public key for client-side integration
 */
export const getPaystackPublicKey = (): string => {
  if (!PAYSTACK_PUBLIC_KEY) {
    console.warn('Paystack public key not configured. Payment will not work.');
  }
  return PAYSTACK_PUBLIC_KEY;
};

/**
 * Validate Paystack webhook signature
 *
 * Use this in your webhook handler to verify requests are from Paystack
 */
export const validateWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');
  return hash === signature;
};

/**
 * Handle Paystack webhook events
 *
 * Common events:
 * - charge.success: Payment successful
 * - transfer.success: Transfer successful
 * - transfer.failed: Transfer failed
 */
export const handlePaystackWebhook = async (event: any) => {
  const eventType = event.event;
  const data = event.data;

  switch (eventType) {
    case 'charge.success':
      // Payment successful - update booking
      if (data.metadata?.booking_id) {
        await processCompletedPayment(
          data.metadata.booking_id,
          data.metadata.property_id,
          data.amount / 100, // Convert from kobo
          data.reference,
          data.metadata
        );
      }
      break;

    case 'transfer.success':
      // Refund successful
      console.log('Transfer successful:', data);
      break;

    case 'transfer.failed':
      // Refund failed
      console.error('Transfer failed:', data);
      break;

    default:
      console.log('Unhandled webhook event:', eventType);
  }
};
