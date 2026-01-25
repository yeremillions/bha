import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProperty, useArchiveProperty, useReactivateProperty, useDeleteProperty } from '@/hooks/useProperties';
import { cn } from '@/lib/utils';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  Loader2,
  XCircle,
  Bed,
  Bath,
  Users,
  MapPin,
  Star,
  DollarSign,
  Home,
  Shield,
  Zap,
  Wifi,
  Tv,
  UtensilsCrossed,
  ImageIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

// Amenity display configuration
const amenityConfig = {
  security: { icon: Shield, label: 'Security', description: 'CCTV Surveillance, 24/7 Armed Security, Gated Premises' },
  power: { icon: Zap, label: 'Power', description: 'Backup Generators, Solar Power, Inverters, 24hr Electricity' },
  wifi: { icon: Wifi, label: 'WiFi', description: 'Ultra-Fast Wi-Fi in All Rooms & Common Areas' },
  entertainment: { icon: Tv, label: 'Smart TV', description: 'Smart TVs with Netflix, YouTube & Cable Channels' },
  kitchen: { icon: UtensilsCrossed, label: 'Kitchen', description: 'Full Kitchen: Fridge, Microwave, Gas Cooker, Utensils' },
};

const statusStyles = {
  available: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  occupied: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  maintenance: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  inactive: 'bg-muted text-muted-foreground border-border',
};

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
};

const PropertyDetails = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch property data
  const { data: property, isLoading, error } = useProperty(id);
  const archiveProperty = useArchiveProperty();
  const reactivateProperty = useReactivateProperty();
  const deleteProperty = useDeleteProperty();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleArchive = async () => {
    if (!property) return;
    await archiveProperty.mutateAsync(property.id);
  };

  const handleReactivate = async () => {
    if (!property) return;
    await reactivateProperty.mutateAsync(property.id);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!property) return;
    await deleteProperty.mutateAsync(property.id);
    navigate('/dashboard/properties');
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading property details...</p>
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
              <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
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

  const images = property.images?.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'];

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
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/properties')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{property.name}</h1>
                  <Badge variant="outline" className={statusStyles[property.status as keyof typeof statusStyles]}>
                    {statusLabels[property.status as keyof typeof statusLabels] || property.status}
                  </Badge>
                  {property.featured && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                  {property.address && ` • ${property.address}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/properties/${property.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {property.status === 'inactive' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 hover:text-emerald-700"
                  onClick={handleReactivate}
                  disabled={reactivateProperty.isPending}
                >
                  {reactivateProperty.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                  )}
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700"
                  onClick={handleArchive}
                  disabled={archiveProperty.isPending}
                >
                  {archiveProperty.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4 mr-2" />
                  )}
                  Archive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${property.name} - Image ${currentImageIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            className={cn(
                              "h-2 w-2 rounded-full transition-colors",
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            )}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 rounded-full px-3 py-1.5">
                    <ImageIcon className="h-4 w-4 text-white" />
                    <span className="text-white text-sm">{currentImageIndex + 1} / {images.length}</span>
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        className={cn(
                          "flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors",
                          index === currentImageIndex ? "border-accent" : "border-transparent hover:border-border"
                        )}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={img} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Description */}
              {property.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  {property.amenities && property.amenities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {property.amenities.map((amenity) => {
                        const config = amenityConfig[amenity as keyof typeof amenityConfig];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <div key={amenity} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-border/50">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">{config.label}</p>
                              <p className="text-sm text-muted-foreground">{config.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No amenities listed for this property.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Per Night</span>
                    <span className="text-2xl font-bold">{formatCurrency(property.base_price_per_night)}</span>
                  </div>
                  {property.cleaning_fee && property.cleaning_fee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cleaning Fee</span>
                      <span className="font-medium">{formatCurrency(property.cleaning_fee)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <p>Property Type: <span className="text-foreground capitalize">{property.type}</span></p>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-accent/5">
                      <Bed className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <p className="text-lg font-bold">{property.bedrooms}</p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/5">
                      <Bath className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <p className="text-lg font-bold">{property.bathrooms}</p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/5">
                      <Users className="h-5 w-5 mx-auto mb-1 text-accent" />
                      <p className="text-lg font-bold">{property.max_guests}</p>
                      <p className="text-xs text-muted-foreground">Max Guests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                      <span className="text-2xl font-bold">{property.rating || 'N/A'}</span>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <p className="font-medium">{property.review_count || 0} reviews</p>
                      <p className="text-sm text-muted-foreground">Guest feedback</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Property Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(new Date(property.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(new Date(property.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property ID</span>
                    <span className="font-mono text-xs">{property.id.slice(0, 8)}...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Property"
        description="Are you sure you want to permanently delete this property? This action cannot be undone. If there are existing bookings or maintenance records, the deletion will fail."
        confirmText="Delete Permanently"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PropertyDetails;
