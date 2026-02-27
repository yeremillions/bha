import { useState, useEffect, forwardRef } from 'react';
import { Star, MapPin, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingDialog } from '@/components/booking/BookingDialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, differenceInDays } from 'date-fns';

type Property = Tables<'properties'>;

interface AvailabilityResultsProps {
  checkIn: string;
  checkOut: string;
  onClear: () => void;
}

const PropertyCard = ({
  property,
  onBookNow,
  checkIn,
  checkOut
}: {
  property: Property;
  onBookNow: (property: Property) => void;
  checkIn: string;
  checkOut: string;
}) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const defaultImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80';
  const images = property.images?.length ? property.images : [defaultImage];
  const hasMultipleImages = images.length > 1;

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
  const totalPrice = property.base_price_per_night * nights;

  const rating = property.rating || 4.5;
  const reviewCount = property.review_count || 0;

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-shadow border-accent/20">
      <div className="relative h-56 overflow-hidden">
        {hasMultipleImages ? (
          <Carousel setApi={setCarouselApi} className="w-full h-full">
            <CarouselContent className="-ml-0 h-full">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-0 h-56">
                  <img
                    src={image}
                    alt={`${property.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <button
              onClick={(e) => {
                e.stopPropagation();
                carouselApi?.scrollPrev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                carouselApi?.scrollNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    carouselApi?.scrollTo(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${index === currentSlide
                    ? 'bg-background'
                    : 'bg-background/50 hover:bg-background/75'
                    }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </Carousel>
        ) : (
          <img
            src={images[0]}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground z-10">
          Available
        </div>
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
        <div className="bg-secondary/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span>{nights} {nights === 1 ? 'night' : 'nights'}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              {formatPrice(property.base_price_per_night)} × {nights}
            </span>
            <span className="font-display text-xl font-bold text-foreground">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => onBookNow(property)}
        >
          Book Now
        </Button>
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
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export const AvailabilityResults = forwardRef<HTMLElement, AvailabilityResultsProps>(
  ({ checkIn, checkOut, onClear }, ref) => {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

    const { data: availableProperties, isLoading, error } = useQuery({
      queryKey: ['available-properties', checkIn, checkOut],
      queryFn: async () => {
        // First get all available properties
        const { data: allProperties, error: propError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'available');

        if (propError) throw propError;
        if (!allProperties) return [];

        // Then get bookings that overlap with the selected date range
        const { data: conflictingBookings, error: bookingError } = await supabase
          .from('bookings')
          .select('property_id')
          .not('status', 'eq', 'cancelled')
          .or(`and(check_in_date.lte.${checkOut},check_out_date.gte.${checkIn})`);

        if (bookingError) throw bookingError;

        // Filter out properties with conflicting bookings
        const bookedPropertyIds = new Set(conflictingBookings?.map(b => b.property_id) || []);
        return allProperties.filter(p => !bookedPropertyIds.has(p.id));
      },
      enabled: !!checkIn && !!checkOut,
    });

    const handleBookNow = (property: Property) => {
      setSelectedProperty(property);
      setBookingDialogOpen(true);
    };

    const formattedCheckIn = checkIn ? format(parseISO(checkIn), 'MMM d, yyyy') : '';
    const formattedCheckOut = checkOut ? format(parseISO(checkOut), 'MMM d, yyyy') : '';

    return (
      <section ref={ref} className="pt-12 pb-20 lg:pt-16 lg:pb-32 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-4">
              <Calendar className="h-4 w-4" />
              <span className="font-body text-sm font-medium">
                {formattedCheckIn} → {formattedCheckOut}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Available Properties
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-3xl mx-auto mb-4">
              {isLoading
                ? 'Searching for available properties...'
                : availableProperties?.length
                  ? `Showing ${availableProperties.length} ${availableProperties.length === 1 ? 'property' : 'properties'} available for ${format(parseISO(checkIn), 'MMM d, yyyy')} → ${format(parseISO(checkOut), 'MMM d, yyyy')}.`
                  : 'No properties available for the selected dates'
              }
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.getElementById('availability-search-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Update Search
              </Button>
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear Search
              </Button>
            </div>
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
                <p className="text-muted-foreground">Unable to search properties. Please try again later.</p>
              </div>
            ) : availableProperties?.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground mb-4">No properties are available for the selected dates.</p>
                <p className="text-sm text-muted-foreground">Try different dates or browse all our properties.</p>
              </div>
            ) : (
              availableProperties?.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onBookNow={handleBookNow}
                  checkIn={checkIn}
                  checkOut={checkOut}
                />
              ))
            )}
          </div>
        </div>

        {selectedProperty && (
          <BookingDialog
            open={bookingDialogOpen}
            onOpenChange={setBookingDialogOpen}
            property={selectedProperty}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
          />
        )}
      </section>
    );
  }
);

AvailabilityResults.displayName = 'AvailabilityResults';
