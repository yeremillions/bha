import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
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
  className?: string;
  disabled?: boolean;
}

/**
 * Paystack Payment Button Component
 *
 * Integrates with Paystack Inline to process payments
 * Handles payment initialization, success, and verification
 *
 * Usage:
 * <PaystackButton
 *   bookingId="123"
 *   propertyId="456"
 *   customerEmail="customer@example.com"
 *   customerName="John Doe"
 *   amount={150000}
 *   bookingNumber="BK001"
 *   onSuccess={() => console.log('Payment successful')}
 * />
 */
export const PaystackButton = ({
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
}: PaystackButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutate: processPayment } = useProcessPayment();

  // Generate unique payment reference
  const reference = generatePaymentReference(bookingId);

  // Paystack configuration
  const config = {
    reference,
    email: customerEmail,
    amount: Math.round(amount * 100), // Convert Naira to kobo
    publicKey: getPaystackPublicKey(),
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

  // Handle payment button click
  const handlePaymentClick = () => {
    // Validate configuration
    if (!config.publicKey) {
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
    initializePayment(handlePaymentSuccess, handlePaymentClose);
  };

  return (
    <Button
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
};

export default PaystackButton;
