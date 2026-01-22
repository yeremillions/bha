import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

export interface BusinessInfo {
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currency: string;
  timezone: string;
}

export interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

export interface NotificationPreferences {
  newBooking: boolean;
  cancellation: boolean;
  checkIn: boolean;
  checkOut: boolean;
  lowInventory: boolean;
  maintenance: boolean;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailTemplates {
  'booking-confirmation': EmailTemplate;
  'cancellation': EmailTemplate;
  'check-in-reminder': EmailTemplate;
  'receipt': EmailTemplate;
}

export interface BookingConfig {
  instantBooking: boolean;
  requireDeposit: boolean;
  minBookingDays: number;
  maxBookingDays: number;
  checkInTime: string;
  checkOutTime: string;
  depositPercent: number;
}

export interface PaymentConfig {
  paystackEnabled: boolean;
  paystackPublicKey: string;
  acceptCash: boolean;
  acceptBankTransfer: boolean;
  acceptCard: boolean;
}

export interface CancellationPolicy {
  fullRefundDays: number;
  partialRefundDays: number;
  partialRefundPercent: number;
  noRefundMessage: string;
}

export interface SeasonalPricingRule {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  multiplier: number;
  active: boolean;
}

export interface AuditLog {
  id: string;
  user_email: string | null;
  action: string;
  details: string | null;
  created_at: string;
}

const defaultBusinessInfo: BusinessInfo = {
  businessName: 'Brooklyn Hills Apartments',
  email: 'info@brooklynhillsapartment.com',
  phone: '+234 XXX XXX XXXX',
  whatsapp: '+234 XXX XXX XXXX',
  address: 'Uyo, Akwa Ibom State, Nigeria',
  currency: 'ngn',
  timezone: 'wat',
};

const defaultBranding: Branding = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#D946EF',
  logoUrl: '',
};

const defaultNotifications: NotificationPreferences = {
  newBooking: true,
  cancellation: true,
  checkIn: true,
  checkOut: true,
  lowInventory: true,
  maintenance: false,
};

const defaultEmailTemplates: EmailTemplates = {
  'booking-confirmation': {
    subject: 'Your Booking is Confirmed - {{property_name}}',
    body: `Dear {{guest_name}},

Thank you for your booking at {{property_name}}!

Booking Details:
- Check-in: {{check_in_date}} at {{check_in_time}}
- Check-out: {{check_out_date}} at {{check_out_time}}
- Property: {{property_name}}
- Total Amount: {{total_amount}}

We look forward to hosting you!

Best regards,
The Brooklyn Hills Team`,
  },
  cancellation: {
    subject: 'Booking Cancellation Confirmed - {{property_name}}',
    body: `Dear {{guest_name}},

Your booking has been cancelled as requested.

Cancelled Booking Details:
- Property: {{property_name}}
- Original Check-in: {{check_in_date}}
- Refund Amount: {{refund_amount}}

If you have any questions, please contact us.

Best regards,
The Brooklyn Hills Team`,
  },
  'check-in-reminder': {
    subject: 'Check-in Reminder - Tomorrow at {{property_name}}',
    body: `Dear {{guest_name}},

This is a friendly reminder that your check-in is tomorrow!

Details:
- Check-in: {{check_in_date}} at {{check_in_time}}
- Property: {{property_name}}
- Address: {{property_address}}

Please don't hesitate to reach out if you need anything.

Best regards,
The Brooklyn Hills Team`,
  },
  receipt: {
    subject: 'Payment Receipt - {{property_name}}',
    body: `Dear {{guest_name}},

Thank you for your payment!

Receipt Details:
- Booking ID: {{booking_id}}
- Property: {{property_name}}
- Amount Paid: {{amount_paid}}
- Payment Method: {{payment_method}}
- Date: {{payment_date}}

Best regards,
The Brooklyn Hills Team`,
  },
};

const defaultBookingConfig: BookingConfig = {
  instantBooking: true,
  requireDeposit: true,
  minBookingDays: 1,
  maxBookingDays: 30,
  checkInTime: '14:00',
  checkOutTime: '11:00',
  depositPercent: 30,
};

const defaultPaymentConfig: PaymentConfig = {
  paystackEnabled: true,
  paystackPublicKey: '',
  acceptCash: true,
  acceptBankTransfer: true,
  acceptCard: true,
};

const defaultCancellationPolicy: CancellationPolicy = {
  fullRefundDays: 7,
  partialRefundDays: 3,
  partialRefundPercent: 50,
  noRefundMessage: 'Cancellations within 3 days of check-in are non-refundable.',
};

// Type guard to check if value is an object
function isJsonObject(value: Json | undefined): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function useSettings() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultNotifications);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplates>(defaultEmailTemplates);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig>(defaultBookingConfig);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(defaultPaymentConfig);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>(defaultCancellationPolicy);
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricingRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch all settings
  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*');

      if (settingsError) throw settingsError;

      // Parse settings from database
      settingsData?.forEach((setting) => {
        const value = setting.value;
        if (!isJsonObject(value)) return;

        switch (setting.key) {
          case 'business_info':
            setBusinessInfo({ ...defaultBusinessInfo, ...value as unknown as BusinessInfo });
            break;
          case 'branding':
            setBranding({ ...defaultBranding, ...value as unknown as Branding });
            break;
          case 'notifications':
            setNotifications({ ...defaultNotifications, ...value as unknown as NotificationPreferences });
            break;
          case 'email_templates':
            setEmailTemplates({ ...defaultEmailTemplates, ...value as unknown as EmailTemplates });
            break;
          case 'booking_config':
            setBookingConfig({ ...defaultBookingConfig, ...value as unknown as BookingConfig });
            break;
          case 'payment_config':
            setPaymentConfig({ ...defaultPaymentConfig, ...value as unknown as PaymentConfig });
            break;
          case 'cancellation_policy':
            setCancellationPolicy({ ...defaultCancellationPolicy, ...value as unknown as CancellationPolicy });
            break;
        }
      });

      // Fetch seasonal pricing
      const { data: pricingData, error: pricingError } = await supabase
        .from('seasonal_pricing')
        .select('*')
        .order('start_date', { ascending: true });

      if (pricingError) throw pricingError;
      setSeasonalPricing(
        (pricingData || []).map((p) => ({
          id: p.id,
          name: p.name,
          start_date: p.start_date,
          end_date: p.end_date,
          multiplier: Number(p.multiplier),
          active: p.active,
        }))
      );

      // Fetch audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setAuditLogs(logsData || []);

    } catch (error: unknown) {
      console.error('Error fetching settings:', error);
      // Don't show error toast for permission errors (user not admin)
    } finally {
      setLoading(false);
    }
  };

  // Save a setting
  const saveSetting = async (key: string, value: Json, actionDescription: string) => {
    try {
      setSaving(true);

      // First try to update existing
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ value })
          .eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({ key, value });
        if (error) throw error;
      }

      // Log the action
      await logAction(actionDescription, `Updated ${key}`);

      toast({
        title: 'Settings saved',
        description: 'Your changes have been saved successfully.',
      });

    } catch (error: unknown) {
      console.error('Error saving setting:', error);
      toast({
        title: 'Error saving settings',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Log an action
  const logAction = async (action: string, details: string) => {
    try {
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        user_email: user?.email || 'Unknown',
        action,
        details,
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  // Save business info
  const saveBusinessInfo = () => saveSetting('business_info', businessInfo as unknown as Json, 'Updated business information');

  // Save branding
  const saveBranding = () => saveSetting('branding', branding as unknown as Json, 'Updated branding settings');

  // Save notifications
  const saveNotifications = () => saveSetting('notifications', notifications as unknown as Json, 'Updated notification preferences');

  // Save email templates
  const saveEmailTemplates = () => saveSetting('email_templates', emailTemplates as unknown as Json, 'Updated email templates');

  // Save booking config
  const saveBookingConfig = () => saveSetting('booking_config', bookingConfig as unknown as Json, 'Updated booking configuration');

  // Save payment config
  const savePaymentConfig = () => saveSetting('payment_config', paymentConfig as unknown as Json, 'Updated payment configuration');

  // Save cancellation policy
  const saveCancellationPolicy = () => saveSetting('cancellation_policy', cancellationPolicy as unknown as Json, 'Updated cancellation policy');

  // Add seasonal pricing rule
  const addSeasonalPricingRule = async (rule: Omit<SeasonalPricingRule, 'id'>) => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('seasonal_pricing')
        .insert({
          name: rule.name,
          start_date: rule.start_date,
          end_date: rule.end_date,
          multiplier: rule.multiplier,
          active: rule.active,
        })
        .select()
        .single();

      if (error) throw error;

      setSeasonalPricing((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          multiplier: Number(data.multiplier),
          active: data.active,
        },
      ]);
      await logAction('Added seasonal pricing rule', `Created ${rule.name}`);

      toast({
        title: 'Pricing rule added',
        description: `${rule.name} has been created.`,
      });
    } catch (error: unknown) {
      console.error('Error adding pricing rule:', error);
      toast({
        title: 'Error adding pricing rule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Update seasonal pricing rule
  const updateSeasonalPricingRule = async (id: string, updates: Partial<SeasonalPricingRule>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('seasonal_pricing')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSeasonalPricing((prev) =>
        prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
      );

      await logAction('Updated seasonal pricing rule', `Modified rule ${id}`);
    } catch (error: unknown) {
      console.error('Error updating pricing rule:', error);
      toast({
        title: 'Error updating pricing rule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete seasonal pricing rule
  const deleteSeasonalPricingRule = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('seasonal_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSeasonalPricing((prev) => prev.filter((rule) => rule.id !== id));
      await logAction('Deleted seasonal pricing rule', `Removed rule ${id}`);

      toast({
        title: 'Pricing rule deleted',
        description: 'The pricing rule has been removed.',
      });
    } catch (error: unknown) {
      console.error('Error deleting pricing rule:', error);
      toast({
        title: 'Error deleting pricing rule',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload logo
  const uploadLogo = async (file: File) => {
    try {
      setSaving(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(fileName);

      const newBranding = { ...branding, logoUrl: urlData.publicUrl };
      setBranding(newBranding);
      await saveSetting('branding', newBranding as unknown as Json, 'Updated business logo');

      toast({
        title: 'Logo uploaded',
        description: 'Your logo has been updated successfully.',
      });
    } catch (error: unknown) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error uploading logo',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Load more audit logs
  const loadMoreAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(auditLogs.length, auditLogs.length + 49);

      if (error) throw error;
      setAuditLogs((prev) => [...prev, ...(data || [])]);
    } catch (error) {
      console.error('Error loading more logs:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  return {
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
    addSeasonalPricingRule,
    updateSeasonalPricingRule,
    deleteSeasonalPricingRule,
    auditLogs,
    loadMoreAuditLogs,
    refetch: fetchSettings,
  };
}
