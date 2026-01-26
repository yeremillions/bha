import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Bell,
  CreditCard,
  Users,
  Shield,
  Save,
  Plus,
  User,
  Mail,
  XCircle,
  History,
  Palette,
  Calendar,
  Upload,
  Eye,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings, type EmailTemplates as EmailTemplatesType } from "@/hooks/useSettings";
import { useSystemSetting, useUpdateSystemSetting } from "@/hooks/useHousekeeping";
import { usePendingInvitations, useResendInvitation, useRevokeInvitation, useDeleteInvitation } from "@/hooks/useTeamInvitations";
import { useCanManageInvitations, useAdminUsers, useIsOwner, useIsAdmin, useIsManager, useCurrentUser } from "@/hooks/useCurrentUser";
import { InviteTeamMemberDialog } from "@/components/settings/InviteTeamMemberDialog";
import { AdminUsersList } from "@/components/settings/AdminUsersList";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  const [selectedTemplate, setSelectedTemplate] = useState<keyof EmailTemplatesType>("booking-confirmation");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Access control - only admins and managers can access settings
  const { data: userProfile, isLoading: userLoading } = useCurrentUser();
  const isManager = useIsManager();
  const isAdmin = useIsAdmin();

  // Redirect non-admin/manager users to dashboard
  useEffect(() => {
    if (!userLoading && userProfile && !isManager) {
      navigate('/dashboard', { replace: true });
    }
  }, [userLoading, userProfile, isManager, navigate]);

  // Team invitations
  const { data: invitations = [], isLoading: invitationsLoading } = usePendingInvitations();
  const resendInvitation = useResendInvitation();
  const revokeInvitation = useRevokeInvitation();
  const deleteInvitation = useDeleteInvitation();
  const canManageInvitations = useCanManageInvitations();

  const {
    loading,
    saving,
    businessInfo,
    setBusinessInfo,
    saveBusinessInfo,
    branding,
    setBranding,
    saveBranding,
    uploadLogo,
    notifications,
    setNotifications,
    saveNotifications,
    emailTemplates,
    setEmailTemplates,
    saveEmailTemplates,
    bookingConfig,
    setBookingConfig,
    saveBookingConfig,
    paymentConfig,
    setPaymentConfig,
    savePaymentConfig,
    cancellationPolicy,
    setCancellationPolicy,
    saveCancellationPolicy,
    seasonalPricing,
    updateSeasonalPricingRule,
    deleteSeasonalPricingRule,
    auditLogs,
    loadMoreAuditLogs,
  } = useSettings();

  // Housekeeping settings
  const { data: assignmentModeSetting } = useSystemSetting('housekeeping_assignment_mode');
  const { data: autoCreateSetting } = useSystemSetting('housekeeping_auto_create_on_checkout');
  const updateSetting = useUpdateSystemSetting();

  const [housekeepingAssignmentMode, setHousekeepingAssignmentMode] = useState<string>('automatic');
  const [housekeepingAutoCreate, setHousekeepingAutoCreate] = useState<boolean>(true);

  // Update local state when settings load
  useState(() => {
    if (assignmentModeSetting) {
      const mode = JSON.parse(assignmentModeSetting.setting_value as string);
      setHousekeepingAssignmentMode(mode);
    }
    if (autoCreateSetting) {
      setHousekeepingAutoCreate(autoCreateSetting.setting_value as boolean);
    }
  });

  const saveHousekeepingSettings = async () => {
    await updateSetting.mutateAsync({
      key: 'housekeeping_assignment_mode',
      value: JSON.stringify(housekeepingAssignmentMode),
    });
    await updateSetting.mutateAsync({
      key: 'housekeeping_auto_create_on_checkout',
      value: housekeepingAutoCreate,
    });
  };

  const tabs = [
    { id: "business", label: "Business Info", icon: Building2 },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "email-templates", label: "Email Templates", icon: Mail },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "cancellation", label: "Cancellation Policy", icon: XCircle },
    { id: "seasonal-pricing", label: "Seasonal Pricing", icon: Calendar },
    { id: "housekeeping", label: "Housekeeping", icon: Sparkles },
    { id: "users", label: "User Management", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "audit-log", label: "Audit Log", icon: History },
  ];

  const templateOptions = [
    { value: "booking-confirmation", label: "Booking Confirmation" },
    { value: "cancellation", label: "Cancellation Notice" },
    { value: "check-in-reminder", label: "Check-in Reminder" },
    { value: "receipt", label: "Payment Receipt" },
  ];

  const availableVariables = [
    "{{guest_name}}", "{{property_name}}", "{{check_in_date}}", "{{check_out_date}}",
    "{{check_in_time}}", "{{check_out_time}}", "{{total_amount}}", "{{booking_id}}",
    "{{refund_amount}}", "{{property_address}}", "{{amount_paid}}", "{{payment_method}}", "{{payment_date}}"
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file);
    }
  };

  const getSaveHandler = () => {
    switch (activeTab) {
      case "business": return saveBusinessInfo;
      case "branding": return saveBranding;
      case "notifications": return saveNotifications;
      case "email-templates": return saveEmailTemplates;
      case "payment": return () => { saveBookingConfig(); savePaymentConfig(); };
      case "cancellation": return saveCancellationPolicy;
      default: return undefined;
    }
  };

  const saveHandler = getSaveHandler();

  // Show loading while checking permissions
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if user doesn't have access (redirect will happen via useEffect)
  if (!isManager) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-6 lg:p-8">
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
            {saveHandler && (
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={saveHandler}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            )}
          </div>

          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="lg:hidden mb-6">
            <Card>
              <CardContent className="p-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0",
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Desktop Sidebar Navigation */}
            <Card className="hidden lg:block lg:col-span-1 h-fit">
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
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Content Area */}
            <div className="lg:col-span-3 w-full space-y-6">
              {loading ? (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <>
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
                          <Input 
                            id="businessName" 
                            value={businessInfo.businessName}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={businessInfo.email}
                              onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                              id="phone" 
                              value={businessInfo.phone}
                              onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">WhatsApp Number</Label>
                          <Input 
                            id="whatsapp" 
                            value={businessInfo.whatsapp}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Business Address</Label>
                          <Textarea 
                            id="address" 
                            value={businessInfo.address}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select 
                              value={businessInfo.currency}
                              onValueChange={(value) => setBusinessInfo({ ...businessInfo, currency: value })}
                            >
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
                            <Select 
                              value={businessInfo.timezone}
                              onValueChange={(value) => setBusinessInfo({ ...businessInfo, timezone: value })}
                            >
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

                  {/* Branding */}
                  {activeTab === "branding" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display">
                          <Palette className="h-5 w-5 text-primary" />
                          Branding & Appearance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Business Logo</Label>
                          <p className="text-sm text-muted-foreground">Upload your logo for invoices, emails, and the customer portal</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                              {branding.logoUrl ? (
                                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                              ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="space-y-2">
                              <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoUpload}
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => logoInputRef.current?.click()}
                                disabled={saving}
                              >
                                <Upload className="h-4 w-4" />
                                Upload Logo
                              </Button>
                              <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor">Primary Brand Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                id="primaryColor"
                                value={branding.primaryColor}
                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                className="h-10 w-16 rounded cursor-pointer border border-border"
                              />
                              <Input 
                                value={branding.primaryColor}
                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Used for buttons, links, and accents</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                id="secondaryColor"
                                value={branding.secondaryColor}
                                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                className="h-10 w-16 rounded cursor-pointer border border-border"
                              />
                              <Input 
                                value={branding.secondaryColor}
                                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                className="flex-1"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Used for highlights and gradients</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Label className="mb-3 block">Preview</Label>
                          <div 
                            className="p-6 rounded-lg border border-border"
                            style={{ background: `linear-gradient(135deg, ${branding.primaryColor}20, ${branding.secondaryColor}20)` }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div 
                                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: branding.primaryColor }}
                              >
                                BH
                              </div>
                              <div>
                                <h3 className="font-semibold">{businessInfo.businessName}</h3>
                                <p className="text-sm text-muted-foreground">Premium Accommodation</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                style={{ backgroundColor: branding.primaryColor }}
                                className="text-white hover:opacity-90"
                              >
                                Primary Button
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                              >
                                Secondary Button
                              </Button>
                            </div>
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
                            { key: "newBooking" as const, label: "New Booking Notifications", desc: "Receive alerts when new bookings are made" },
                            { key: "cancellation" as const, label: "Cancellation Alerts", desc: "Get notified of booking cancellations" },
                            { key: "checkIn" as const, label: "Check-in Reminders", desc: "Reminders for upcoming check-ins" },
                            { key: "checkOut" as const, label: "Check-out Reminders", desc: "Reminders for upcoming check-outs" },
                            { key: "lowInventory" as const, label: "Low Inventory Alerts", desc: "Alerts for low stock items" },
                            { key: "maintenance" as const, label: "Maintenance Alerts", desc: "Notifications for maintenance issues" },
                          ].map((item) => (
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
                  )}

                  {/* Email Templates */}
                  {activeTab === "email-templates" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display">
                          <Mail className="h-5 w-5 text-primary" />
                          Email Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Select Template</Label>
                          <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as keyof EmailTemplatesType)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {templateOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emailSubject">Email Subject</Label>
                          <Input 
                            id="emailSubject" 
                            value={emailTemplates[selectedTemplate].subject}
                            onChange={(e) => setEmailTemplates(prev => ({
                              ...prev,
                              [selectedTemplate]: { ...prev[selectedTemplate], subject: e.target.value }
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emailBody">Email Body</Label>
                          <Textarea 
                            id="emailBody" 
                            value={emailTemplates[selectedTemplate].body}
                            onChange={(e) => setEmailTemplates(prev => ({
                              ...prev,
                              [selectedTemplate]: { ...prev[selectedTemplate], body: e.target.value }
                            }))}
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Available Variables</Label>
                          <p className="text-sm text-muted-foreground mb-2">Click to copy. Use these in your templates.</p>
                          <div className="flex flex-wrap gap-2">
                            {availableVariables.map((variable) => (
                              <Badge 
                                key={variable} 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-primary/20 transition-colors"
                                onClick={() => navigator.clipboard.writeText(variable)}
                              >
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Preview Email
                          </Button>
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
                              <Input 
                                id="minBooking" 
                                type="number" 
                                value={bookingConfig.minBookingDays}
                                onChange={(e) => setBookingConfig({ ...bookingConfig, minBookingDays: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxBooking">Maximum Booking (Days)</Label>
                              <Input 
                                id="maxBooking" 
                                type="number" 
                                value={bookingConfig.maxBookingDays}
                                onChange={(e) => setBookingConfig({ ...bookingConfig, maxBookingDays: parseInt(e.target.value) || 30 })}
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
                                onChange={(e) => setBookingConfig({ ...bookingConfig, checkInTime: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="checkOutTime">Default Check-out Time</Label>
                              <Input 
                                id="checkOutTime" 
                                type="time" 
                                value={bookingConfig.checkOutTime}
                                onChange={(e) => setBookingConfig({ ...bookingConfig, checkOutTime: e.target.value })}
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
                              <Input 
                                id="depositPercent" 
                                type="number" 
                                value={bookingConfig.depositPercent}
                                onChange={(e) => setBookingConfig({ ...bookingConfig, depositPercent: parseInt(e.target.value) || 30 })}
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
                                onCheckedChange={(checked) => setPaymentConfig({ ...paymentConfig, paystackEnabled: checked })}
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
                                onChange={(e) => setPaymentConfig({ ...paymentConfig, paystackPublicKey: e.target.value })}
                              />
                            </div>
                          )}

                          <div className="space-y-4">
                            <Label>Accepted Payment Methods</Label>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  id="cash" 
                                  checked={paymentConfig.acceptCash}
                                  onCheckedChange={(checked) => 
                                    setPaymentConfig(prev => ({ ...prev, acceptCash: !!checked }))
                                  }
                                />
                                <Label htmlFor="cash" className="font-normal cursor-pointer">Cash Payment</Label>
                              </div>
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  id="transfer" 
                                  checked={paymentConfig.acceptBankTransfer}
                                  onCheckedChange={(checked) => 
                                    setPaymentConfig(prev => ({ ...prev, acceptBankTransfer: !!checked }))
                                  }
                                />
                                <Label htmlFor="transfer" className="font-normal cursor-pointer">Bank Transfer</Label>
                              </div>
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  id="card" 
                                  checked={paymentConfig.acceptCard}
                                  onCheckedChange={(checked) => 
                                    setPaymentConfig(prev => ({ ...prev, acceptCard: !!checked }))
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

                  {/* Cancellation Policy */}
                  {activeTab === "cancellation" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display">
                          <XCircle className="h-5 w-5 text-primary" />
                          Cancellation Policy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                          <h4 className="font-medium text-foreground mb-2">Policy Summary</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Full refund if cancelled {cancellationPolicy.fullRefundDays}+ days before check-in</li>
                            <li>• {cancellationPolicy.partialRefundPercent}% refund if cancelled {cancellationPolicy.partialRefundDays}-{cancellationPolicy.fullRefundDays} days before check-in</li>
                            <li>• No refund if cancelled less than {cancellationPolicy.partialRefundDays} days before check-in</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <p className="text-xs text-muted-foreground">Guests receive 100% refund if cancelled before this period</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="partialRefundDays">Partial Refund Period (Days Before Check-in)</Label>
                            <Input 
                              id="partialRefundDays" 
                              type="number" 
                              value={cancellationPolicy.partialRefundDays}
                              onChange={(e) => setCancellationPolicy(prev => ({ 
                                ...prev, 
                                partialRefundDays: parseInt(e.target.value) || 0 
                              }))}
                            />
                            <p className="text-xs text-muted-foreground">Guests receive partial refund if cancelled within this period</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="partialRefundPercent">Partial Refund Percentage (%)</Label>
                          <Input 
                            id="partialRefundPercent" 
                            type="number" 
                            value={cancellationPolicy.partialRefundPercent}
                            onChange={(e) => setCancellationPolicy(prev => ({ 
                              ...prev, 
                              partialRefundPercent: parseInt(e.target.value) || 0 
                            }))}
                          />
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
                          />
                          <p className="text-xs text-muted-foreground">Displayed to guests when cancellation is non-refundable</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Seasonal Pricing */}
                  {activeTab === "seasonal-pricing" && (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 font-display">
                          <Calendar className="h-5 w-5 text-primary" />
                          Seasonal Pricing Rules
                        </CardTitle>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Rule
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Set rate multipliers for specific date ranges. A multiplier of 1.5 means 50% higher rates, 0.85 means 15% discount.
                        </p>

                        {seasonalPricing.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No pricing rules configured yet. Click "Add Rule" to create one.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {seasonalPricing.map((rule) => (
                              <div 
                                key={rule.id} 
                                className={cn(
                                  "p-4 rounded-lg border transition-colors",
                                  rule.active ? "bg-muted/30 border-border" : "bg-muted/10 border-border/50 opacity-60"
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-medium text-foreground">{rule.name}</h4>
                                      <Badge variant={rule.active ? "default" : "secondary"}>
                                        {rule.active ? "Active" : "Inactive"}
                                      </Badge>
                                      <Badge variant="outline" className={cn(
                                        rule.multiplier >= 1 ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600"
                                      )}>
                                        {rule.multiplier >= 1 ? "+" : ""}{((rule.multiplier - 1) * 100).toFixed(0)}%
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span>{rule.start_date} → {rule.end_date}</span>
                                      <span>Multiplier: {rule.multiplier}x</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch 
                                      checked={rule.active}
                                      onCheckedChange={(checked) => {
                                        updateSeasonalPricingRule(rule.id, { active: checked });
                                      }}
                                    />
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => deleteSeasonalPricingRule(rule.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
                        {isAdmin && (
                          <>
                            <div className="space-y-2">
                              <Label>Team Members</Label>
                              <p className="text-sm text-muted-foreground">View and manage all registered team members</p>
                            </div>

                            <AdminUsersList />
                          </>
                        )}

                        {/* Pending Invitations */}
                        {invitationsLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        ) : invitations.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label>Pending Invitations</Label>
                              <Badge variant="outline">{invitations.length}</Badge>
                            </div>
                            {invitations.map((invitation) => (
                              <div
                                key={invitation.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-accent" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{invitation.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Sent {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                                      </span>
                                      {invitation.status === 'pending' && new Date(invitation.expires_at) < new Date() && (
                                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {invitation.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => resendInvitation.mutate(invitation.id)}
                                        disabled={resendInvitation.isPending}
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => revokeInvitation.mutate(invitation.id)}
                                        disabled={revokeInvitation.isPending}
                                      >
                                        <Ban className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={deleteInvitation.isPending}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to permanently delete the invitation for <strong>{invitation.email}</strong>? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteInvitation.mutate(invitation.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {canManageInvitations && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setInviteDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                            Invite Team Member
                          </Button>
                        )}

                        {!canManageInvitations && (
                          <div className="p-4 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm text-muted-foreground">
                              Only admins and managers can invite team members.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Housekeeping Settings */}
                  {activeTab === "housekeeping" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Housekeeping Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="assignmentMode">Task Assignment Mode</Label>
                            <Select
                              value={housekeepingAssignmentMode}
                              onValueChange={setHousekeepingAssignmentMode}
                            >
                              <SelectTrigger id="assignmentMode">
                                <SelectValue placeholder="Select assignment mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="automatic">Automatic Assignment</SelectItem>
                                <SelectItem value="manual">Manual Assignment</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                              {housekeepingAssignmentMode === 'automatic'
                                ? 'Tasks will be automatically assigned to available staff based on workload, ratings, and availability.'
                                : 'Tasks will remain unassigned until manually assigned by a manager.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between space-x-4 p-4 rounded-lg bg-muted/30 border border-border">
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="autoCreate" className="text-base font-medium">
                                Auto-Create Tasks on Checkout
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically create housekeeping tasks when guests check out
                              </p>
                            </div>
                            <Switch
                              id="autoCreate"
                              checked={housekeepingAutoCreate}
                              onCheckedChange={setHousekeepingAutoCreate}
                            />
                          </div>

                          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                            <h4 className="font-semibold text-foreground mb-2">How It Works</h4>
                            <ul className="text-sm text-muted-foreground space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span>
                                <span>When a booking is marked as completed (checked out), a checkout cleaning task is automatically created</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span>
                                <span>In automatic mode, the task is immediately assigned to the best available staff member</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span>
                                <span>In manual mode, the task waits in the unassigned queue for manager assignment</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-accent mt-0.5">•</span>
                                <span>Auto-assignment considers: staff workload, performance ratings, and task priority</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={saveHousekeepingSettings}
                            disabled={updateSetting.isPending}
                          >
                            {updateSetting.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
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

                  {/* Audit Log */}
                  {activeTab === "audit-log" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-display">
                          <History className="h-5 w-5 text-primary" />
                          Audit Log
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Track all configuration changes made to your account.
                        </p>

                        {auditLogs.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No audit logs yet. Changes will appear here once you start configuring settings.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {auditLogs.map((log) => (
                              <div 
                                key={log.id} 
                                className="p-4 rounded-lg bg-muted/30 border border-border"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-foreground truncate">{log.action}</p>
                                      <p className="text-sm text-muted-foreground break-words">{log.details}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span className="truncate max-w-full">{log.user_email}</span>
                                        <span>•</span>
                                        <span className="whitespace-nowrap">{format(new Date(log.created_at), 'PPpp')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {auditLogs.length > 0 && (
                          <Button variant="outline" className="w-full" onClick={loadMoreAuditLogs}>
                            Load More
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Invite Team Member Dialog */}
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Settings;
