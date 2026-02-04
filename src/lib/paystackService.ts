/**
 * Paystack Payment Service
 *
 * Client-side utilities for Paystack integration.
 * Note: All payment verification and processing is done server-side
 * via Edge Functions to keep the secret key secure.
 *
 * Docs: https://paystack.com/docs/
 */

// Paystack public key - safe to expose on client
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

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
 * Get Paystack public key for client-side integration
 */
export const getPaystackPublicKey = (): string => {
  if (!PAYSTACK_PUBLIC_KEY) {
    console.warn('Paystack public key not configured. Payment will not work.');
  }
  return PAYSTACK_PUBLIC_KEY;
};
