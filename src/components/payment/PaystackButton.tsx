import { useState, forwardRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getPaystackPublicKey, generatePaymentReference } from '@/lib/paystackService';
import { useProcessPayment } from '@/hooks/usePayments';

interface PaystackButtonProps {
  bookingId: string;
  propertyId: string;
  customerEmail: string;
  customerName: string;
  amount: number; // In Naira (not kobo)
  bookingNumber: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onPaymentStart?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Paystack Payment Button Component
 *
 * Uses Paystack Popup loaded from index.html script tag
 */
export const PaystackButton = forwardRef<HTMLButtonElement, PaystackButtonProps>(
  (
    {
      bookingId,
      propertyId,
      customerEmail,
      customerName,
      amount,
      bookingNumber,
      onSuccess,
      onClose,
      onPaymentStart,
      className,
      disabled = false,
    },
    ref
  ) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { mutate: processPayment } = useProcessPayment();

    // Generate unique payment reference - memoized to prevent regeneration on re-renders
    const reference = useMemo(
      () => generatePaymentReference(bookingId),
      [bookingId]
    );

    const publicKey = getPaystackPublicKey();

    // Validate email format
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Handle payment button click
    const handlePaymentClick = () => {
      // Validate public key
      if (!publicKey) {
        toast.error('Payment system not configured. Please contact support.');
        console.error('Paystack public key not configured');
        return;
      }

      // Validate customer info
      if (!customerEmail || !customerName) {
        toast.error('Customer information is required for payment');
        console.error('Missing customer info:', { customerEmail, customerName });
        return;
      }

      // Validate email format
      if (!isValidEmail(customerEmail)) {
        toast.error('Please provide a valid email address');
        console.error('Invalid email format:', customerEmail);
        return;
      }

      // Validate amount
      if (amount <= 0) {
        toast.error('Invalid payment amount');
        console.error('Invalid amount:', amount);
        return;
      }

      // Check if PaystackPop is available (loaded from index.html)
      if (!(window as any).PaystackPop) {
        toast.error('Payment system failed to load. Please refresh the page.');
        console.error('PaystackPop not available - script may not have loaded');
        return;
      }

      const amountInKobo = Math.round(amount * 100);

      console.log('Initiating Paystack payment:', {
        reference,
        email: customerEmail,
        amount: amountInKobo,
        currency: 'NGN',
        publicKeyPrefix: publicKey.substring(0, 10) + '...',
      });

      try {
        const handler = (window as any).PaystackPop.setup({
          key: publicKey,
          email: customerEmail,
          amount: amountInKobo,
          currency: 'NGN',
          ref: reference,
          metadata: {
            booking_id: bookingId,
            property_id: propertyId,
            booking_number: bookingNumber,
            customer_name: customerName,
            custom_fields: [
              {
                display_name: 'Booking Number',
                variable_name: 'booking_number',
                value: bookingNumber,
              },
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: customerName,
              },
            ],
          },
          channels: ['card', 'bank', 'ussd', 'bank_transfer'],
          onClose: () => {
            console.log('Payment popup closed by user');
            toast.info('Payment cancelled');
            onClose?.();
          },
          callback: (response: any) => {
            console.log('Paystack payment callback:', response);
            setIsProcessing(true);

            processPayment(
              {
                bookingId,
                propertyId,
                amount,
                reference: response.reference,
                metadata: {
                  paystack_reference: response.reference,
                  paystack_transaction: response.transaction,
                  paystack_status: response.status,
                  customer_email: customerEmail,
                  customer_name: customerName,
                  booking_number: bookingNumber,
                },
              },
              {
                onSuccess: () => {
                  setIsProcessing(false);
                  onSuccess?.();
                },
                onError: (error: any) => {
                  setIsProcessing(false);
                  console.error('Payment processing error:', error);
                },
              }
            );
          },
        });

        // Notify parent that payment is starting (hides the dialog)
        onPaymentStart?.();

        // Small delay to ensure React re-renders and hides the dialog before popup opens
        setTimeout(() => {
          handler.openIframe();
        }, 100);

      } catch (error: any) {
        console.error('Error initializing Paystack:', error);
        toast.error('Failed to initialize payment. Please try again.');
      }
    };

    // Check if Paystack is available
    const isPaystackAvailable = typeof window !== 'undefined' && (window as any).PaystackPop;

    return (
      <Button
        ref={ref}
        onClick={handlePaymentClick}
        disabled={disabled || isProcessing || !isPaystackAvailable}
        className={className}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : !isPaystackAvailable ? (
          <>
            <AlertCircle className="mr-2 h-5 w-5" />
            Payment Unavailable
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay ₦{amount.toLocaleString('en-NG')}
          </>
        )}
      </Button>
    );
  }
);

PaystackButton.displayName = 'PaystackButton';

export default PaystackButton;
