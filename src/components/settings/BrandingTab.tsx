import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Upload, Trash2 } from "lucide-react";

interface Branding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

interface BrandingTabProps {
  branding: Branding;
  setBranding: React.Dispatch<React.SetStateAction<Branding>>;
  uploadLogo: (file: File) => void;
  businessName: string;
}

export const BrandingTab = ({ branding, setBranding, uploadLogo, businessName }: BrandingTabProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo(file);
  };

  return (
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
              <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
              {branding.logoUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => setBranding(prev => ({ ...prev, logoUrl: '' }))}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={branding.primaryColor}
                onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={branding.primaryColor}
                onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={branding.secondaryColor}
                onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={branding.secondaryColor}
                onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                placeholder="#666666"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preview</Label>
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
                <h3 className="font-semibold">{businessName}</h3>
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
  );
};
