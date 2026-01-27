import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

interface BookingConfig {
  minBookingDays: number;
  maxBookingDays: number;
  checkInTime: string;
  checkOutTime: string;
  instantBooking: boolean;
  requireDeposit: boolean;
  depositPercent: number;
}

interface PaymentConfig {
  paystackEnabled: boolean;
  paystackPublicKey: string;
  acceptCash: boolean;
  acceptBankTransfer: boolean;
  acceptCard: boolean;
}

interface PaymentTabProps {
  bookingConfig: BookingConfig;
  setBookingConfig: React.Dispatch<React.SetStateAction<BookingConfig>>;
  paymentConfig: PaymentConfig;
  setPaymentConfig: React.Dispatch<React.SetStateAction<PaymentConfig>>;
}

export const PaymentTab = ({ 
  bookingConfig, 
  setBookingConfig, 
  paymentConfig, 
  setPaymentConfig 
}: PaymentTabProps) => (
  <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <CreditCard className="h-5 w-5 text-primary" />
          Booking Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minBooking">Minimum Booking (Days)</Label>
            <Input 
              id="minBooking" 
              type="number" 
              value={bookingConfig.minBookingDays}
              onChange={(e) => setBookingConfig(prev => ({ ...prev, minBookingDays: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxBooking">Maximum Booking (Days)</Label>
            <Input 
              id="maxBooking" 
              type="number" 
              value={bookingConfig.maxBookingDays}
              onChange={(e) => setBookingConfig(prev => ({ ...prev, maxBookingDays: parseInt(e.target.value) || 30 }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">Default Check-in Time</Label>
            <Input 
              id="checkInTime" 
              type="time" 
              value={bookingConfig.checkInTime}
              onChange={(e) => setBookingConfig(prev => ({ ...prev, checkInTime: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">Default Check-out Time</Label>
            <Input 
              id="checkOutTime" 
              type="time" 
              value={bookingConfig.checkOutTime}
              onChange={(e) => setBookingConfig(prev => ({ ...prev, checkOutTime: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Enable Instant Booking</p>
              <p className="text-sm text-muted-foreground">Allow guests to book without approval</p>
            </div>
            <Switch
              checked={bookingConfig.instantBooking}
              onCheckedChange={(checked) => setBookingConfig(prev => ({ ...prev, instantBooking: checked }))}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground">Require Deposit</p>
              <p className="text-sm text-muted-foreground">Require upfront payment deposit</p>
            </div>
            <Switch
              checked={bookingConfig.requireDeposit}
              onCheckedChange={(checked) => setBookingConfig(prev => ({ ...prev, requireDeposit: checked }))}
            />
          </div>
        </div>

        {bookingConfig.requireDeposit && (
          <div className="space-y-2">
            <Label htmlFor="depositPercent">Deposit Percentage (%)</Label>
            <Input 
              id="depositPercent" 
              type="number" 
              value={bookingConfig.depositPercent}
              onChange={(e) => setBookingConfig(prev => ({ ...prev, depositPercent: parseInt(e.target.value) || 30 }))}
            />
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Paystack Integration</p>
            <p className="text-sm text-muted-foreground">Enable online card payments</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={paymentConfig.paystackEnabled ? "default" : "secondary"}>
              {paymentConfig.paystackEnabled ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={paymentConfig.paystackEnabled}
              onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, paystackEnabled: checked }))}
            />
          </div>
        </div>

        {paymentConfig.paystackEnabled && (
          <div className="space-y-2">
            <Label htmlFor="paystackKey">Paystack Public Key</Label>
            <Input 
              id="paystackKey" 
              type="password" 
              placeholder="pk_live_xxxxxxxxx"
              value={paymentConfig.paystackPublicKey}
              onChange={(e) => setPaymentConfig(prev => ({ ...prev, paystackPublicKey: e.target.value }))}
            />
          </div>
        )}

        <div className="space-y-4">
          <Label>Accepted Payment Methods</Label>
          <div className="space-y-3">
            {[
              { id: "cash", label: "Cash Payment", key: "acceptCash" as const },
              { id: "transfer", label: "Bank Transfer", key: "acceptBankTransfer" as const },
              { id: "card", label: "Card Payment (via Paystack)", key: "acceptCard" as const },
            ].map((method) => (
              <div key={method.id} className="flex items-center gap-3">
                <Checkbox 
                  id={method.id} 
                  checked={paymentConfig[method.key]}
                  onCheckedChange={(checked) => 
                    setPaymentConfig(prev => ({ ...prev, [method.key]: !!checked }))
                  }
                />
                <Label htmlFor={method.id} className="font-normal cursor-pointer">{method.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </>
);
