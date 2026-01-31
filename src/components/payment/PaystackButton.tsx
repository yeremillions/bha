import { useState, forwardRef, useMemo, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
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
  className?: string;
  disabled?: boolean;
}

/**
 * Paystack Payment Button Component
 *
 * Integrates with Paystack Inline to process payments
 * Handles payment initialization, success, and verification
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
      className,
      disabled = false,
    },
    ref
  ) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaystackReady, setIsPaystackReady] = useState(false);
    const { mutate: processPayment } = useProcessPayment();

    // Generate unique payment reference - memoized to prevent regeneration on re-renders
    const reference = useMemo(() => generatePaymentReference(bookingId), [bookingId]);

    // Check if Paystack is properly configured
    const publicKey = getPaystackPublicKey();
    const isConfigured = !!publicKey;

    // Check Paystack script availability
    useEffect(() => {
      // Give the Paystack inline script time to load
      const timer = setTimeout(() => {
        setIsPaystackReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Paystack configuration
    const config = {
      reference,
      email: customerEmail,
      amount: Math.round(amount * 100), // Convert Naira to kobo
      publicKey,
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
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'] as any,
    };

    // Payment success handler
    const handlePaymentSuccess = (paystackResponse: any) => {
      console.log('Paystack payment successful:', paystackResponse);
      setIsProcessing(true);

      // Process payment on our backend
      processPayment(
        {
          bookingId,
          propertyId,
          amount,
          reference: paystackResponse.reference,
          metadata: {
            paystack_reference: paystackResponse.reference,
            paystack_transaction: paystackResponse.transaction,
            paystack_status: paystackResponse.status,
            customer_email: customerEmail,
            customer_name: customerName,
            booking_number: bookingNumber,
          },
        },
        {
          onSuccess: () => {
            setIsProcessing(false);
            toast.success('Payment completed successfully!');
            onSuccess?.();
          },
          onError: (error: any) => {
            setIsProcessing(false);
            toast.error(error.message || 'Failed to process payment');
          },
        }
      );
    };

    // Payment close handler (user closed popup)
    const handlePaymentClose = () => {
      console.log('Payment popup closed');
      toast.info('Payment cancelled');
      onClose?.();
    };

    // Initialize Paystack payment
    const initializePayment = usePaystackPayment(config);

    // Validation checks
    const validationErrors = useMemo(() => {
      const errors: string[] = [];
      if (!isConfigured) errors.push('Payment system not configured');
      if (!customerEmail) errors.push('Customer email required');
      if (!customerName) errors.push('Customer name required');
      if (amount <= 0) errors.push('Invalid payment amount');
      return errors;
    }, [isConfigured, customerEmail, customerName, amount]);

    const isValid = validationErrors.length === 0;

    // Handle payment button click
    const handlePaymentClick = () => {
      // Validate configuration
      if (!isConfigured) {
        toast.error('Payment system not configured. Please contact support.');
        console.error('Paystack public key not configured');
        return;
      }

      if (!customerEmail || !customerName) {
        toast.error('Customer information is required for payment');
        return;
      }

      if (amount <= 0) {
        toast.error('Invalid payment amount');
        return;
      }

      // Initialize payment popup
      try {
        initializePayment({
          onSuccess: handlePaymentSuccess,
          onClose: handlePaymentClose,
        });
      } catch (error) {
        console.error('Failed to initialize Paystack:', error);
        toast.error('Failed to open payment window. Please try again.');
      }
    };

    // Show warning if not configured
    if (!isConfigured) {
      return (
        <Button
          ref={ref}
          disabled
          className={className}
          size="lg"
          variant="outline"
        >
          <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
          Payment Unavailable
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        onClick={handlePaymentClick}
        disabled={disabled || isProcessing || !isValid || !isPaystackReady}
        className={className}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : !isPaystackReady ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
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
