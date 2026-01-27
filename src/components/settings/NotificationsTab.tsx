import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface NotificationSettings {
  newBooking: boolean;
  cancellation: boolean;
  checkIn: boolean;
  checkOut: boolean;
  lowInventory: boolean;
  maintenance: boolean;
}

interface NotificationsTabProps {
  notifications: NotificationSettings;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationSettings>>;
}

const NOTIFICATION_OPTIONS = [
  { key: "newBooking" as const, label: "New Booking Notifications", desc: "Receive alerts when new bookings are made" },
  { key: "cancellation" as const, label: "Cancellation Alerts", desc: "Get notified of booking cancellations" },
  { key: "checkIn" as const, label: "Check-in Reminders", desc: "Reminders for upcoming check-ins" },
  { key: "checkOut" as const, label: "Check-out Reminders", desc: "Reminders for upcoming check-outs" },
  { key: "lowInventory" as const, label: "Low Inventory Alerts", desc: "Alerts for low stock items" },
  { key: "maintenance" as const, label: "Maintenance Alerts", desc: "Notifications for maintenance issues" },
];

export const NotificationsTab = ({ notifications, setNotifications }: NotificationsTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-display">
        <Bell className="h-5 w-5 text-primary" />
        Notification Preferences
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        {NOTIFICATION_OPTIONS.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={notifications[item.key]}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, [item.key]: checked }))
              }
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
