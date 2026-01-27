import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";
import { type CancellationPolicy } from "@/hooks/useSettings";

interface CancellationTabProps {
  cancellationPolicy: CancellationPolicy;
  setCancellationPolicy: React.Dispatch<React.SetStateAction<CancellationPolicy>>;
}

export const CancellationTab = ({ cancellationPolicy, setCancellationPolicy }: CancellationTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-display">
        <XCircle className="h-5 w-5 text-primary" />
        Cancellation Policy
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullRefundDays">Full Refund Period (Days Before Check-in)</Label>
        <Input 
          id="fullRefundDays" 
          type="number" 
          value={cancellationPolicy.fullRefundDays}
          onChange={(e) => setCancellationPolicy(prev => ({ 
            ...prev, 
            fullRefundDays: parseInt(e.target.value) || 0 
          }))}
        />
        <p className="text-sm text-muted-foreground">
          Guests receive a full refund if cancelled this many days before check-in
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partialRefundDays">Partial Refund Period (Days)</Label>
          <Input 
            id="partialRefundDays" 
            type="number" 
            value={cancellationPolicy.partialRefundDays}
            onChange={(e) => setCancellationPolicy(prev => ({ 
              ...prev, 
              partialRefundDays: parseInt(e.target.value) || 0 
            }))}
          />
          <p className="text-sm text-muted-foreground">
            Days before check-in for partial refund eligibility
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="partialRefundPercent">Partial Refund Amount (%)</Label>
          <Input 
            id="partialRefundPercent" 
            type="number" 
            value={cancellationPolicy.partialRefundPercent}
            onChange={(e) => setCancellationPolicy(prev => ({ 
              ...prev, 
              partialRefundPercent: parseInt(e.target.value) || 50 
            }))}
          />
          <p className="text-sm text-muted-foreground">
            Percentage of booking amount refunded
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="noRefundMessage">No Refund Message</Label>
        <Textarea 
          id="noRefundMessage" 
          value={cancellationPolicy.noRefundMessage}
          onChange={(e) => setCancellationPolicy(prev => ({ 
            ...prev, 
            noRefundMessage: e.target.value 
          }))}
          rows={3}
          placeholder="Message shown when cancellation is outside refund period..."
        />
        <p className="text-sm text-muted-foreground">
          Message displayed when guests cancel outside the refund window
        </p>
      </div>

      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <h4 className="font-medium text-foreground mb-2">Policy Summary</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Full refund if cancelled {cancellationPolicy.fullRefundDays}+ days before check-in</li>
          <li>• {cancellationPolicy.partialRefundPercent}% refund if cancelled {cancellationPolicy.partialRefundDays}-{cancellationPolicy.fullRefundDays} days before</li>
          <li>• No refund for cancellations less than {cancellationPolicy.partialRefundDays} days before check-in</li>
        </ul>
      </div>
    </CardContent>
  </Card>
);
