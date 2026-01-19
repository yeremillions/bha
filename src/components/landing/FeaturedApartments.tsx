import { useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/hooks/useProperties';
import { BookingDialog } from '@/components/booking/BookingDialog';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

const PropertyCard = ({ property, onBookNow }: { property: Property; onBookNow: (property: Property) => void }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80';
  const imageUrl = property.images?.[0] || defaultImage;
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get badge based on property
  const getBadge = () => {
    if (property.featured) return { label: 'Featured', className: 'bg-accent text-accent-foreground' };
    if (property.rating && property.rating >= 4.5) return { label: 'Top Rated', className: 'bg-primary text-primary-foreground' };
    return null;
  };

  const badge = getBadge();
  const rating = property.rating || 4.5;
  const reviewCount = property.review_count || 0;

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-shadow">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
            {badge.label}
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} 
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">({reviewCount} reviews)</span>
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">{property.name}</h3>
        <p className="font-body text-muted-foreground text-sm mb-4 flex items-center gap-1">
          <MapPin className="h-4 w-4" /> {property.location}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities?.slice(0, 4).map((amenity) => (
            <span key={amenity} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
              {amenity}
            </span>
          ))}
          {property.bedrooms && (
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-bold text-foreground">
              {formatPrice(property.base_price_per_night)}
            </span>
            <span className="text-muted-foreground text-sm"> / night</span>
          </div>
          <Button 
            size="sm" 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => onBookNow(property)}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-56 w-full" />
    <CardContent className="p-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const FeaturedApartments = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const { data: properties, isLoading, error } = useProperties({
    status: 'available'
  });

  // Get featured properties first, then fill with available properties (up to 3)
  const featuredProperties = properties
    ? [
        ...properties.filter(p => p.featured), // Featured first
        ...properties.filter(p => !p.featured) // Then non-featured
      ].slice(0, 3)
    : [];

  const handleBookNow = (property: Property) => {
    setSelectedProperty(property);
    setBookingDialogOpen(true);
  };

  return (
    <section id="properties" className="py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Apartments in Uyo
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto">
            Discover our handpicked selection of premium apartments, each offering luxury, comfort, and modern amenities for your perfect stay.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </>
          ) : error ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">Unable to load properties. Please try again later.</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No properties available at the moment.</p>
            </div>
          ) : (
            featuredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onBookNow={handleBookNow}
              />
            ))
          )}
        </div>

        <div className="text-center mt-10">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            View All Properties
          </Button>
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedProperty && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          property={selectedProperty}
        />
      )}
    </section>
  );
};
