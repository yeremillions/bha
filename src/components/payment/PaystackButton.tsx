import { useState, forwardRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
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
 * Uses Paystack Popup directly via script injection for better compatibility
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

    // Handle payment button click - use direct PaystackPop
    const handlePaymentClick = () => {
      if (!publicKey) {
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

      const amountInKobo = Math.round(amount * 100);

      console.log('Initiating Paystack payment with:', {
        reference,
        email: customerEmail,
        amount: amountInKobo,
        amountInNaira: amount,
      });

      // Use PaystackPop directly from the global script
      const handler = (window as any).PaystackPop?.setup({
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
          console.log('Payment popup closed');
          toast.info('Payment cancelled');
          onClose?.();
        },
        callback: (response: any) => {
          console.log('Paystack payment successful:', response);
          setIsProcessing(true);

          // Process payment on our backend
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
                toast.success('Payment completed successfully!');
                onSuccess?.();
              },
              onError: (error: any) => {
                setIsProcessing(false);
                toast.error(error.message || 'Failed to process payment');
              },
            }
          );
        },
      });

      if (handler) {
        // Notify parent that payment popup is opening
        onPaymentStart?.();
        handler.openIframe();
      } else {
        // Fallback: Load Paystack script dynamically if not available
        console.log('PaystackPop not found, loading script...');
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => {
          console.log('Paystack script loaded, retrying...');
          handlePaymentClick();
        };
        script.onerror = () => {
          toast.error('Failed to load payment system. Please refresh and try again.');
        };
        document.body.appendChild(script);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handlePaymentClick}
        disabled={disabled || isProcessing}
        className={className}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
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
