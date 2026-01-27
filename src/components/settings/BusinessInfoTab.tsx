import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface BusinessInfo {
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  currency: string;
  timezone: string;
}

interface BusinessInfoTabProps {
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: BusinessInfo) => void;
}

export const BusinessInfoTab = ({ businessInfo, setBusinessInfo }: BusinessInfoTabProps) => {
  const updateField = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo({ ...businessInfo, [field]: value });
  };

  return (
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
            onChange={(e) => updateField('businessName', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={businessInfo.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              value={businessInfo.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input 
            id="whatsapp" 
            value={businessInfo.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <Textarea 
            id="address" 
            value={businessInfo.address}
            onChange={(e) => updateField('address', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select 
              value={businessInfo.currency}
              onValueChange={(value) => updateField('currency', value)}
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
              onValueChange={(value) => updateField('timezone', value)}
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
  );
};
