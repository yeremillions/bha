import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Bell,
  CreditCard,
  Users,
  Shield,
  Save,
  Mail,
  XCircle,
  History,
  Palette,
  Calendar,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings, type EmailTemplates } from "@/hooks/useSettings";
import { useSystemSetting, useUpdateSystemSetting } from "@/hooks/useHousekeeping";
import { usePendingInvitations, useResendInvitation, useRevokeInvitation, useDeleteInvitation } from "@/hooks/useTeamInvitations";
import { useCanManageInvitations, useIsAdmin, useIsManager, useCurrentUser } from "@/hooks/useCurrentUser";

// Tab components
import { SettingsNavigation } from "@/components/settings/SettingsNavigation";
import { BusinessInfoTab } from "@/components/settings/BusinessInfoTab";
import { BrandingTab } from "@/components/settings/BrandingTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { EmailTemplatesTab } from "@/components/settings/EmailTemplatesTab";
import { PaymentTab } from "@/components/settings/PaymentTab";
import { CancellationTab } from "@/components/settings/CancellationTab";
import { SeasonalPricingTab } from "@/components/settings/SeasonalPricingTab";
import { HousekeepingTab } from "@/components/settings/HousekeepingTab";
import { UserManagementTab } from "@/components/settings/UserManagementTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { AuditLogTab } from "@/components/settings/AuditLogTab";

const TABS = [
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

const Settings = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  const [selectedTemplate, setSelectedTemplate] = useState<keyof EmailTemplates>("booking-confirmation");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Access control
  const { data: userProfile, isLoading: userLoading } = useCurrentUser();
  const isManager = useIsManager();
  const isAdmin = useIsAdmin();

  // Redirect non-admin/manager users
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

  // Settings hook
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

  const [housekeepingAssignmentMode, setHousekeepingAssignmentMode] = useState('automatic');
  const [housekeepingAutoCreate, setHousekeepingAutoCreate] = useState(true);

  // Sync housekeeping settings from server
  useEffect(() => {
    if (assignmentModeSetting) {
      try {
        setHousekeepingAssignmentMode(JSON.parse(assignmentModeSetting.setting_value as string));
      } catch { /* ignore parse errors */ }
    }
    if (autoCreateSetting !== undefined) {
      setHousekeepingAutoCreate(autoCreateSetting.setting_value as boolean);
    }
  }, [assignmentModeSetting, autoCreateSetting]);

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

  // Memoized save handler
  const saveHandler = useMemo(() => {
    const handlers: Record<string, (() => void) | undefined> = {
      business: saveBusinessInfo,
      branding: saveBranding,
      notifications: saveNotifications,
      "email-templates": saveEmailTemplates,
      payment: () => { saveBookingConfig(); savePaymentConfig(); },
      cancellation: saveCancellationPolicy,
    };
    return handlers[activeTab];
  }, [activeTab, saveBusinessInfo, saveBranding, saveNotifications, saveEmailTemplates, saveBookingConfig, savePaymentConfig, saveCancellationPolicy]);

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access denied
  if (!isManager) return null;

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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your business configuration and preferences</p>
            </div>
            {saveHandler && (
              <Button onClick={saveHandler} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            )}
          </div>

          {/* Navigation */}
          <SettingsNavigation tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 lg:mt-0">
            <div className="hidden lg:block" /> {/* Spacer for sidebar */}
            <div className="lg:col-span-3 space-y-6">
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
                  {activeTab === "business" && (
                    <BusinessInfoTab businessInfo={businessInfo} setBusinessInfo={setBusinessInfo} />
                  )}
                  {activeTab === "branding" && (
                    <BrandingTab 
                      branding={branding} 
                      setBranding={setBranding} 
                      uploadLogo={uploadLogo}
                      businessName={businessInfo.businessName}
                    />
                  )}
                  {activeTab === "notifications" && (
                    <NotificationsTab notifications={notifications} setNotifications={setNotifications} />
                  )}
                  {activeTab === "email-templates" && (
                    <EmailTemplatesTab 
                      selectedTemplate={selectedTemplate}
                      setSelectedTemplate={setSelectedTemplate}
                      emailTemplates={emailTemplates}
                      setEmailTemplates={setEmailTemplates}
                    />
                  )}
                  {activeTab === "payment" && (
                    <PaymentTab 
                      bookingConfig={bookingConfig}
                      setBookingConfig={setBookingConfig}
                      paymentConfig={paymentConfig}
                      setPaymentConfig={setPaymentConfig}
                    />
                  )}
                  {activeTab === "cancellation" && (
                    <CancellationTab 
                      cancellationPolicy={cancellationPolicy}
                      setCancellationPolicy={setCancellationPolicy}
                    />
                  )}
                  {activeTab === "seasonal-pricing" && (
                    <SeasonalPricingTab 
                      seasonalPricing={seasonalPricing}
                      updateSeasonalPricingRule={updateSeasonalPricingRule}
                      deleteSeasonalPricingRule={deleteSeasonalPricingRule}
                    />
                  )}
                  {activeTab === "housekeeping" && (
                    <HousekeepingTab 
                      assignmentMode={housekeepingAssignmentMode}
                      setAssignmentMode={setHousekeepingAssignmentMode}
                      autoCreate={housekeepingAutoCreate}
                      setAutoCreate={setHousekeepingAutoCreate}
                      onSave={saveHousekeepingSettings}
                      isSaving={updateSetting.isPending}
                    />
                  )}
                  {activeTab === "users" && (
                    <UserManagementTab 
                      isAdmin={isAdmin}
                      invitations={invitations}
                      invitationsLoading={invitationsLoading}
                      canManageInvitations={canManageInvitations}
                      resendInvitation={resendInvitation}
                      revokeInvitation={revokeInvitation}
                      deleteInvitation={deleteInvitation}
                    />
                  )}
                  {activeTab === "security" && (
                    <SecurityTab 
                      twoFactorEnabled={twoFactorEnabled}
                      setTwoFactorEnabled={setTwoFactorEnabled}
                    />
                  )}
                  {activeTab === "audit-log" && (
                    <AuditLogTab auditLogs={auditLogs} loadMoreAuditLogs={loadMoreAuditLogs} />
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
