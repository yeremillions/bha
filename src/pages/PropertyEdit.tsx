import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProperty, useUpdateProperty } from '@/hooks/useProperties';
import { PropertyImageUpload } from '@/components/property/PropertyImageUpload';
import { cn } from '@/lib/utils';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  XCircle,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Users,
  Star,
  Shield,
  Zap,
  Wifi,
  Tv,
  UtensilsCrossed,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const amenityOptions = [
  { id: 'security', label: 'Security', icon: Shield, description: '24/7 Security & CCTV' },
  { id: 'power', label: 'Power', icon: Zap, description: 'Backup generators & inverters' },
  { id: 'wifi', label: 'WiFi', icon: Wifi, description: 'High-speed internet' },
  { id: 'entertainment', label: 'Smart TV', icon: Tv, description: 'Streaming services' },
  { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed, description: 'Full kitchen facilities' },
];

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'villa', label: 'Villa' },
];

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
];

const PropertyEdit = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch property data
  const { data: property, isLoading, error } = useProperty(id);
  const updateProperty = useUpdateProperty();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'apartment',
    description: '',
    location: '',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    base_price_per_night: 0,
    cleaning_fee: 0,
    amenities: [] as string[],
    status: 'available',
    featured: false,
    images: [] as string[],
  });

  // Initialize form when property loads
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        type: property.type,
        description: property.description || '',
        location: property.location,
        address: property.address || '',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        max_guests: property.max_guests,
        base_price_per_night: property.base_price_per_night,
        cleaning_fee: property.cleaning_fee || 0,
        amenities: property.amenities || [],
        status: property.status,
        featured: property.featured || false,
        images: property.images || [],
      });
      setHasUnsavedChanges(false);
    }
  }, [property]);

  // Track form changes
  useEffect(() => {
    if (property) {
      const changed =
        formData.name !== property.name ||
        formData.type !== property.type ||
        formData.description !== (property.description || '') ||
        formData.location !== property.location ||
        formData.address !== (property.address || '') ||
        formData.bedrooms !== property.bedrooms ||
        formData.bathrooms !== property.bathrooms ||
        formData.max_guests !== property.max_guests ||
        formData.base_price_per_night !== property.base_price_per_night ||
        formData.cleaning_fee !== (property.cleaning_fee || 0) ||
        JSON.stringify(formData.amenities.sort()) !== JSON.stringify((property.amenities || []).sort()) ||
        formData.status !== property.status ||
        formData.featured !== (property.featured || false) ||
        JSON.stringify(formData.images) !== JSON.stringify(property.images || []);
      setHasUnsavedChanges(changed);
    }
  }, [formData, property]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleSave = async () => {
    if (!property) return;

    // Validation
    if (!formData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Property name is required.', variant: 'destructive' });
      return;
    }
    if (!formData.location.trim()) {
      toast({ title: 'Validation Error', description: 'Location is required.', variant: 'destructive' });
      return;
    }
    if (formData.base_price_per_night <= 0) {
      toast({ title: 'Validation Error', description: 'Price per night must be greater than 0.', variant: 'destructive' });
      return;
    }

    try {
      await updateProperty.mutateAsync({
        id: property.id,
        updates: {
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          location: formData.location,
          address: formData.address || null,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          max_guests: formData.max_guests,
          base_price_per_night: formData.base_price_per_night,
          cleaning_fee: formData.cleaning_fee || null,
          amenities: formData.amenities,
          status: formData.status,
          featured: formData.featured,
          images: formData.images,
        },
      });
      navigate(`/dashboard/properties/${property.id}`);
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setCancelDialogOpen(true);
    } else {
      navigate(`/dashboard/properties/${id}`);
    }
  };

  const confirmCancel = () => {
    navigate(`/dashboard/properties/${id}`);
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}>
          <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <XCircle className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Property Not Found</h2>
              <p className="text-muted-foreground">The property you're trying to edit doesn't exist.</p>
              <Button onClick={() => navigate('/dashboard/properties')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Properties
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Property</h1>
                <p className="text-muted-foreground">{property.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={handleSave}
                disabled={updateProperty.isPending || !hasUnsavedChanges}
              >
                {updateProperty.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Property Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Deluxe Ocean View Suite"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Property Type</Label>
                      <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the property..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Uyo, Akwa Ibom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="e.g., 123 Main Street"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Capacity & Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_guests">Max Guests</Label>
                      <Input
                        id="max_guests"
                        type="number"
                        min="1"
                        value={formData.max_guests}
                        onChange={(e) => handleInputChange('max_guests', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {amenityOptions.map((amenity) => {
                      const Icon = amenity.icon;
                      const isChecked = formData.amenities.includes(amenity.id);
                      return (
                        <div
                          key={amenity.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            isChecked ? "bg-accent/10 border-accent" : "border-border hover:bg-muted/50"
                          )}
                          onClick={() => handleAmenityToggle(amenity.id)}
                        >
                          <Checkbox checked={isChecked} onCheckedChange={() => handleAmenityToggle(amenity.id)} />
                          <Icon className={cn("h-5 w-5", isChecked ? "text-accent" : "text-muted-foreground")} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{amenity.label}</p>
                            <p className="text-xs text-muted-foreground">{amenity.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <PropertyImageUpload
                propertyId={property.id}
                images={formData.images}
                onImagesChange={(images) => handleInputChange('images', images)}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Night (₦) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={formData.base_price_per_night}
                      onChange={(e) => handleInputChange('base_price_per_night', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cleaning_fee">Cleaning Fee (₦)</Label>
                    <Input
                      id="cleaning_fee"
                      type="number"
                      min="0"
                      value={formData.cleaning_fee}
                      onChange={(e) => handleInputChange('cleaning_fee', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status & Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', !!checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="featured" className="cursor-pointer flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Featured Property
                      </Label>
                      <p className="text-xs text-muted-foreground">Show on landing page</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to leave? All changes will be lost."
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        variant="destructive"
        onConfirm={confirmCancel}
      />
    </div>
  );
};

export default PropertyEdit;
