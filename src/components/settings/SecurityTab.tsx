import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useResetSystemData } from "@/hooks/useSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SecurityTabProps {
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (enabled: boolean) => void;
}

export const SecurityTab = ({ twoFactorEnabled, setTwoFactorEnabled }: SecurityTabProps) => {
  const { user } = useAuth();
  const userEmail = user?.email;
  const { resetData, resetting } = useResetSystemData();
  const [confirmText, setConfirmText] = useState("");

  const handleReset = async () => {
    if (confirmText === 'RESET') {
      await resetData();
      setConfirmText("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Shield className="h-5 w-5 text-primary" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>Update Password</Button>
        </div>

        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </div>

        {userEmail === 'yeremibolton@gmail.com' && (
          <div className="pt-6 border-t border-destructive/20">
            <h3 className="text-lg font-medium text-destructive mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h3>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Reset System Data</p>
                  <p className="text-sm text-destructive/80 mt-1">
                    Permanently delete all bookings, transactions, inventory history, and reset stats.
                    <br />
                    <span className="font-bold">This action cannot be undone.</span>
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Reset Data</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action will permanently delete all booking records, transactions,
                        and reset all system statistics. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label className="mb-2 block">Type <span className="font-bold">RESET</span> to confirm</Label>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="RESET"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={handleReset}
                        disabled={confirmText !== 'RESET' || resetting}
                      >
                        {resetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Delete All Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
