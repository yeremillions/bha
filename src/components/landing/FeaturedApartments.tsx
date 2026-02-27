import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronLeft, ChevronRight, ShieldCheck, Zap, Wifi, Wind, UtensilsCrossed, Droplets, Car, Tv } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/hooks/useProperties';
import { BookingDialog } from '@/components/booking/BookingDialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { Tables } from '@/integrations/supabase/types';

type Property = Tables<'properties'>;

const PropertyCard = ({ property, onBookNow }: { property: Property; onBookNow: (property: Property) => void }) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const defaultImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80';
  const images = property.images?.length ? property.images : [defaultImage];
  const hasMultipleImages = images.length > 1;

  // Update current slide when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const rating = property.rating || 4.5;

  const amenityIcons: Record<string, any> = {
    '24/7 Security': ShieldCheck,
    'Backup Power Supply': Zap,
    'High-Speed Wi-Fi': Wifi,
    'Air Conditioning': Wind,
    'Fully Equipped Kitchen': UtensilsCrossed,
    'Water Heater': Droplets,
    'Parking Space': Car,
    'Smart TV/DSTV': Tv,
  };

  return (
    <div className="group cursor-pointer" onClick={() => onBookNow(property)}>
      {/* Editorial Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-muted">
        {hasMultipleImages ? (
          <Carousel setApi={setCarouselApi} className="w-full h-full">
            <CarouselContent className="-ml-0 h-full">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-0 h-full">
                  <img
                    src={image}
                    alt={`${property.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Minimalist Navigation */}
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  carouselApi?.scrollPrev();
                }}
                className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  carouselApi?.scrollNext();
                }}
                className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Carousel>
        ) : (
          <img
            src={images[0]}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Floating badge for Featured/Price if needed, or keep clean */}
        {property.featured && (
          <div className="absolute top-4 left-0 bg-[#D4AF37] text-white px-3 py-1 text-xs uppercase tracking-widest font-medium">
            Featured
          </div>
        )}
      </div>

      {/* Editorial Content */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-display text-2xl font-medium text-foreground group-hover:text-[#D4AF37] transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {property.location}
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {property.amenities?.map((amenity) => {
            const Icon = amenityIcons[amenity];
            if (!Icon) return null;
            return (
              <div
                key={amenity}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary/30 border border-border/40 rounded-sm text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent/40 group/amenity"
                title={amenity}
              >
                <Icon className="h-2.5 w-2.5 text-accent/80 group-hover/amenity:text-accent" />
                <span>{amenity}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border/50 mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting from</span>
            <span className="font-display text-xl text-[#D4AF37]">
              {formatPrice(property.base_price_per_night)}
            </span>
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-foreground hover:text-[#D4AF37] hover:no-underline group/btn"
          >
            View Details <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
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
  const navigate = useNavigate();
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
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate('/properties')}
          >
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
