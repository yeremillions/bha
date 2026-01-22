import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, ShieldCheck, Building2 } from 'lucide-react';
import { useSendInvitation, type InvitationRole, type InvitationDepartment } from '@/hooks/useTeamInvitations';

interface InviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteTeamMemberDialog = ({ open, onOpenChange }: InviteTeamMemberDialogProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitationRole>('staff');
  const [department, setDepartment] = useState<InvitationDepartment>('reception');
  const sendInvitation = useSendInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !role || !department) {
      return;
    }

    try {
      await sendInvitation.mutateAsync({ email, role, department });
      // Reset form and close dialog
      setEmail('');
      setRole('staff');
      setDepartment('reception');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to send invitation:', error);
    }
  };

  const roleDescriptions = {
    admin: 'Full system access + Settings',
    manager: 'Approve bookings, manage operations',
    receptionist: 'Create bookings, check-ins',
    staff: 'View and complete assigned tasks only',
  };

  const departmentDescriptions = {
    management: 'Access to all modules and features',
    reception: 'Bookings, Properties, Customers',
    housekeeping: 'Housekeeping tasks and schedules',
    bar: 'Bar management, tabs, inventory',
    maintenance: 'Maintenance issues and work orders',
    security: 'Security monitoring and reports',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to add a new team member. They will receive a link to create their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sendInvitation.isPending}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as InvitationRole)}
              disabled={sendInvitation.isPending}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">Full system access</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Manager</div>
                      <div className="text-xs text-muted-foreground">Manage operations & approvals</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="receptionist">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">Receptionist</div>
                      <div className="text-xs text-muted-foreground">Handle bookings & check-ins</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Staff</div>
                      <div className="text-xs text-muted-foreground">Complete assigned tasks</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Role Description */}
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{role.charAt(0).toUpperCase() + role.slice(1)}:</strong> {roleDescriptions[role]}
              </p>
            </div>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={department}
              onValueChange={(value) => setDepartment(value as InvitationDepartment)}
              disabled={sendInvitation.isPending}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="management">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium">Management</div>
                      <div className="text-xs text-muted-foreground">All modules</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="reception">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Reception</div>
                      <div className="text-xs text-muted-foreground">Bookings & guests</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="housekeeping">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">Housekeeping</div>
                      <div className="text-xs text-muted-foreground">Cleaning tasks</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-500" />
                    <div>
                      <div className="font-medium">Bar</div>
                      <div className="text-xs text-muted-foreground">Bar operations</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">Maintenance</div>
                      <div className="text-xs text-muted-foreground">Repairs & issues</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="security">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">Security</div>
                      <div className="text-xs text-muted-foreground">Security monitoring</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Department Description */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{department.charAt(0).toUpperCase() + department.slice(1)}:</strong> {departmentDescriptions[department]}
              </p>
            </div>
          </div>

          {/* Important Note */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">📧 Email Invitation</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              The team member will receive an email with a secure link to create their account and set their password. The link expires in 7 days.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={sendInvitation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!email || !role || !department || sendInvitation.isPending}
            >
              {sendInvitation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
