import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Bell, 
  CreditCard, 
  Users, 
  Shield,
  Save,
  Plus,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("business");

  const tabs = [
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "users", label: "User Management", icon: Users },
    { id: "security", label: "Security", icon: Shield },
  ];

  // Form states
  const [notifications, setNotifications] = useState({
    newBooking: true,
    cancellation: true,
    checkIn: true,
    checkOut: true,
    lowInventory: true,
    maintenance: false,
  });

  const [bookingConfig, setBookingConfig] = useState({
    instantBooking: true,
    requireDeposit: true,
  });

  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    bankTransfer: true,
    card: true,
  });

  const [paystackEnabled, setPaystackEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your business configuration and preferences
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <Card className="lg:col-span-1 h-fit">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Business Information */}
              {activeTab === "business" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Building2 className="h-5 w-5 text-primary" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input id="businessName" defaultValue="Brooklyn Hills Apartments" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="info@brooklynhills.ng" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue="+234 XXX XXX XXXX" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input id="whatsapp" defaultValue="+234 XXX XXX XXXX" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Textarea 
                        id="address" 
                        defaultValue="Uyo, Akwa Ibom State, Nigeria"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select defaultValue="ngn">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                            <SelectItem value="usd">US Dollar ($)</SelectItem>
                            <SelectItem value="eur">Euro (€)</SelectItem>
                            <SelectItem value="gbp">British Pound (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select defaultValue="wat">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wat">Africa/Lagos (WAT)</SelectItem>
                            <SelectItem value="gmt">GMT</SelectItem>
                            <SelectItem value="est">Eastern Time (EST)</SelectItem>
                            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notification Preferences */}
              {activeTab === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Bell className="h-5 w-5 text-primary" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: "newBooking", label: "New Booking Notifications", desc: "Receive alerts when new bookings are made" },
                        { key: "cancellation", label: "Cancellation Alerts", desc: "Get notified of booking cancellations" },
                        { key: "checkIn", label: "Check-in Reminders", desc: "Reminders for upcoming check-ins" },
                        { key: "checkOut", label: "Check-out Reminders", desc: "Reminders for upcoming check-outs" },
                        { key: "lowInventory", label: "Low Inventory Alerts", desc: "Alerts for low stock items" },
                        { key: "maintenance", label: "Maintenance Alerts", desc: "Notifications for maintenance issues" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked) =>
                              setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Configuration */}
              {activeTab === "payment" && (
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
                          <Input id="minBooking" type="number" defaultValue="1" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxBooking">Maximum Booking (Days)</Label>
                          <Input id="maxBooking" type="number" defaultValue="30" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="checkInTime">Default Check-in Time</Label>
                          <Input id="checkInTime" type="time" defaultValue="14:00" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkOutTime">Default Check-out Time</Label>
                          <Input id="checkOutTime" type="time" defaultValue="11:00" />
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
                            onCheckedChange={(checked) =>
                              setBookingConfig((prev) => ({ ...prev, instantBooking: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">Require Deposit</p>
                            <p className="text-sm text-muted-foreground">Require upfront payment deposit</p>
                          </div>
                          <Switch
                            checked={bookingConfig.requireDeposit}
                            onCheckedChange={(checked) =>
                              setBookingConfig((prev) => ({ ...prev, requireDeposit: checked }))
                            }
                          />
                        </div>
                      </div>

                      {bookingConfig.requireDeposit && (
                        <div className="space-y-2">
                          <Label htmlFor="depositPercent">Deposit Percentage (%)</Label>
                          <Input id="depositPercent" type="number" defaultValue="30" />
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
                          <Badge variant={paystackEnabled ? "default" : "secondary"}>
                            {paystackEnabled ? "Active" : "Inactive"}
                          </Badge>
                          <Switch
                            checked={paystackEnabled}
                            onCheckedChange={setPaystackEnabled}
                          />
                        </div>
                      </div>

                      {paystackEnabled && (
                        <div className="space-y-2">
                          <Label htmlFor="paystackKey">Paystack Public Key</Label>
                          <Input id="paystackKey" type="password" placeholder="pk_live_xxxxxxxxx" />
                        </div>
                      )}

                      <div className="space-y-4">
                        <Label>Accepted Payment Methods</Label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              id="cash" 
                              checked={paymentMethods.cash}
                              onCheckedChange={(checked) => 
                                setPaymentMethods(prev => ({ ...prev, cash: !!checked }))
                              }
                            />
                            <Label htmlFor="cash" className="font-normal cursor-pointer">Cash Payment</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              id="transfer" 
                              checked={paymentMethods.bankTransfer}
                              onCheckedChange={(checked) => 
                                setPaymentMethods(prev => ({ ...prev, bankTransfer: !!checked }))
                              }
                            />
                            <Label htmlFor="transfer" className="font-normal cursor-pointer">Bank Transfer</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              id="card" 
                              checked={paymentMethods.card}
                              onCheckedChange={(checked) => 
                                setPaymentMethods(prev => ({ ...prev, card: !!checked }))
                              }
                            />
                            <Label htmlFor="card" className="font-normal cursor-pointer">Card Payment (via Paystack)</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* User Management */}
              {activeTab === "users" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <Users className="h-5 w-5 text-primary" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Admin Users</Label>
                      <p className="text-sm text-muted-foreground">Manage staff access and permissions</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Admin User</p>
                            <p className="text-sm text-muted-foreground">admin@brooklynhills.ng</p>
                          </div>
                        </div>
                        <Badge>Owner</Badge>
                      </div>
                    </div>

                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Invite Team Member
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
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
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
