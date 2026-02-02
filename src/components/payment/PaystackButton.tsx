import { useState, forwardRef, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPaystackPublicKey, generatePaymentReference } from '@/lib/paystackService';
import { useProcessPayment } from '@/hooks/usePayments';

// Track if Paystack script is already loading/loaded
let paystackScriptStatus: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';

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
    const [isLoadingScript, setIsLoadingScript] = useState(false);
    const { mutate: processPayment } = useProcessPayment();

    // Generate unique payment reference - memoized to prevent regeneration on re-renders
    const reference = useMemo(
      () => generatePaymentReference(bookingId),
      [bookingId]
    );

    const publicKey = getPaystackPublicKey();

    // Load Paystack script on mount if not already loaded
    useEffect(() => {
      if (paystackScriptStatus === 'idle' && !(window as any).PaystackPop) {
        loadPaystackScript();
      }
    }, []);

    const loadPaystackScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as any).PaystackPop) {
          paystackScriptStatus = 'loaded';
          resolve();
          return;
        }

        if (paystackScriptStatus === 'loading') {
          // Wait for existing load to complete
          const checkInterval = setInterval(() => {
            if ((window as any).PaystackPop) {
              clearInterval(checkInterval);
              resolve();
            } else if (paystackScriptStatus === 'error') {
              clearInterval(checkInterval);
              reject(new Error('Failed to load Paystack'));
            }
          }, 100);
          return;
        }

        paystackScriptStatus = 'loading';
        setIsLoadingScript(true);

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;

        script.onload = () => {
          console.log('Paystack script loaded successfully');
          paystackScriptStatus = 'loaded';
          setIsLoadingScript(false);
          resolve();
        };

        script.onerror = () => {
          console.error('Failed to load Paystack script');
          paystackScriptStatus = 'error';
          setIsLoadingScript(false);
          reject(new Error('Failed to load Paystack script'));
        };

        document.head.appendChild(script);
      });
    };

    const initiatePayment = () => {
      const amountInKobo = Math.round(amount * 100);

      console.log('Opening Paystack popup with:', {
        reference,
        email: customerEmail,
        amount: amountInKobo,
      });

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
          console.log('Payment popup closed');
          toast.info('Payment cancelled');
          onClose?.();
        },
        callback: (response: any) => {
          console.log('Paystack payment successful:', response);
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

      onPaymentStart?.();
      handler.openIframe();
    };

    // Handle payment button click
    const handlePaymentClick = async () => {
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

      // Check if PaystackPop is available
      if (!(window as any).PaystackPop) {
        setIsLoadingScript(true);
        try {
          await loadPaystackScript();
          initiatePayment();
        } catch (error) {
          toast.error('Failed to load payment system. Please refresh the page and try again.');
          setIsLoadingScript(false);
        }
      } else {
        initiatePayment();
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handlePaymentClick}
        disabled={disabled || isProcessing || isLoadingScript}
        className={className}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : isLoadingScript ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading Payment...
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
