import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { PaystackButton } from './PaystackButton';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    booking_number: string;
    property_id: string;
    property?: {
      name: string;
      address?: string;
    };
    customer?: {
      name: string;
      email: string;
    };
    check_in_date: string;
    check_out_date: string;
    num_guests: number;
    base_amount: number;
    cleaning_fee?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount: number;
    payment_status: string;
  };
  onPaymentSuccess?: () => void;
}

/**
 * Payment Dialog Component
 *
 * Displays booking details and Paystack payment button
 *
 * Usage:
 * <PaymentDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   booking={bookingData}
 *   onPaymentSuccess={() => navigate('/bookings')}
 * />
 */
export const PaymentDialog = ({
  open,
  onOpenChange,
  booking,
  onPaymentSuccess,
}: PaymentDialogProps) => {
  const handlePaymentSuccess = () => {
    onPaymentSuccess?.();
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isPaid = booking.payment_status === 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment for Booking</span>
            <Badge variant={isPaid ? 'default' : 'secondary'}>
              {booking.booking_number}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete your payment to confirm your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Property Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  {booking.property?.name || 'Property'}
                </p>
                {booking.property?.address && (
                  <p className="text-sm text-muted-foreground">
                    {booking.property.address}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium">
                  {format(new Date(booking.check_in_date), 'MMM d, yyyy')}
                </span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="font-medium">
                  {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {booking.num_guests} {booking.num_guests === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Price Breakdown</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Amount</span>
                <span className="font-medium">{formatCurrency(booking.base_amount)}</span>
              </div>

              {booking.cleaning_fee && booking.cleaning_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cleaning Fee</span>
                  <span className="font-medium">
                    {formatCurrency(booking.cleaning_fee)}
                  </span>
                </div>
              )}

              {booking.tax_amount && booking.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (6%)</span>
                  <span className="font-medium">{formatCurrency(booking.tax_amount)}</span>
                </div>
              )}

              {booking.discount_amount && booking.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -{formatCurrency(booking.discount_amount)}
                  </span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">
                  {formatCurrency(booking.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status or Button */}
          {isPaid ? (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-center">
              <p className="text-green-700 dark:text-green-400 font-semibold">
                Payment Completed ✓
              </p>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                Your booking has been confirmed
              </p>
            </div>
          ) : (
            <PaystackButton
              bookingId={booking.id}
              propertyId={booking.property_id}
              customerEmail={booking.customer?.email || ''}
              customerName={booking.customer?.name || ''}
              amount={booking.total_amount}
              bookingNumber={booking.booking_number}
              onSuccess={handlePaymentSuccess}
              onClose={() => onOpenChange(false)}
              className="w-full"
            />
          )}

          {/* Security Notice */}
          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Paystack. Your payment information is encrypted
            and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
