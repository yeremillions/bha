import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, MapPin, ChevronLeft, ChevronRight, Search, SlidersHorizontal, ShieldCheck, Zap, Wifi, Wind, UtensilsCrossed, Droplets, Car, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAvailableProperties } from '@/hooks/useAvailableProperties';
import { useProperties } from '@/hooks/useProperties';
import { BookingDialog } from '@/components/booking/BookingDialog';
import { AvailabilitySearch } from '@/components/booking/AvailabilitySearch';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/landing/Header';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { Tables } from '@/integrations/supabase/types';
import { format, parseISO } from 'date-fns';
import propertiesHero from '@/assets/properties-hero.jpg';

type Property = Tables<'properties'>;

const PropertyCard = ({ property, onBookNow, index = 0 }: { property: Property; onBookNow: (property: Property) => void; index?: number }) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const defaultImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80';
  const images = property.images?.length ? property.images : [defaultImage];
  const hasMultipleImages = images.length > 1;

  // Stagger animation delay
  const animationDelay = `${(index % 6) * 0.1}s`;

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
    }).format(price);
  };

  const badge = property.featured
    ? { label: 'Featured', className: 'bg-accent text-white border-accent' }
    : property.rating && property.rating >= 4.8
      ? { label: 'Highly Rated', className: 'bg-primary text-white border-primary' }
      : null;

  const rating = property.rating || 4.5;
  const reviewCount = property.review_count || 0;

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
    <Card
      className="overflow-hidden border-border/50 bg-card hover-lift animate-fade-in group opacity-0"
      style={{ animationDelay }}
    >
      <div className="relative h-64 md:h-72 overflow-hidden">
        {hasMultipleImages ? (
          <Carousel setApi={setCarouselApi} className="w-full h-full">
            <CarouselContent className="-ml-0 h-full">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-0 h-64 md:h-72">
                  <img
                    src={image}
                    alt={`${property.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <button
              onClick={(e) => {
                e.stopPropagation();
                carouselApi?.scrollPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-black/40"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                carouselApi?.scrollNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-black/40"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    carouselApi?.scrollTo(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'w-6 bg-accent'
                    : 'w-1.5 bg-white/50 hover:bg-white'
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
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {badge && (
          <div className={`absolute top-4 left-4 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold rounded-full border shadow-sm z-10 ${badge.className}`}>
            {badge.label}
          </div>
        )}

        {/* Overlay for better text separation */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-accent fill-accent" />
            <span className="text-sm font-medium text-foreground">{rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({reviewCount} reviews)</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-accent px-2 py-0.5 border border-accent/20 rounded">
            {property.type}
          </span>
        </div>

        <h3 className="font-display text-2xl font-medium text-foreground mb-3 leading-tight tracking-tight group-hover:text-accent transition-colors duration-300">
          {property.name}
        </h3>

        <p className="font-body text-muted-foreground text-sm mb-6 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent/60" /> {property.location}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {property.amenities?.map((amenity) => {
            const Icon = amenityIcons[amenity];
            if (!Icon) return null;
            return (
              <div
                key={amenity}
                className="flex items-center gap-1.5 px-3 py-1 bg-secondary/50 border border-border/40 rounded-sm text-[10px] uppercase tracking-wider font-semibold text-secondary-foreground transition-all duration-300 hover:border-accent/40 group/amenity"
                title={amenity}
              >
                <Icon className="h-2.5 w-2.5 text-accent/80 group-hover/amenity:text-accent" />
                <span>{amenity}</span>
              </div>
            );
          })}
          {property.bedrooms && (
            <div className="flex items-center px-3 py-1 bg-secondary/50 border border-border/40 rounded-sm text-[10px] uppercase tracking-wider font-semibold text-secondary-foreground">
              {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Price from</div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-accent">
                {formatPrice(property.base_price_per_night)}
              </span>
              <span className="text-muted-foreground text-xs">/night</span>
            </div>
          </div>
          <Button
            className="rounded-none px-8 bg-primary hover:bg-primary/90 text-white font-medium tracking-wide transition-all duration-300 hover:scale-[1.02]"
            onClick={() => onBookNow(property)}
          >
            BOOK NOW
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden border-border/50 bg-card">
    <Skeleton className="h-64 md:h-72 w-full rounded-none" />
    <CardContent className="p-8 space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-border/50">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
);

const PublicProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [propertyType, setPropertyType] = useState('all');

  // Get date range from URL params
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const hasDateFilter = Boolean(checkIn && checkOut);

  // Use availability-filtered query when dates are present
  const { data: filteredProperties, isLoading: isLoadingFiltered, error: filteredError } = useAvailableProperties({
    checkIn: hasDateFilter ? checkIn : undefined,
    checkOut: hasDateFilter ? checkOut : undefined,
    search: searchQuery,
    type: propertyType,
    sortBy,
  });

  // Fallback to regular properties query when no dates
  const { data: allProperties, isLoading: isLoadingAll, error: allError } = useProperties({
    status: 'available'
  });

  const isLoading = hasDateFilter ? isLoadingFiltered : isLoadingAll;
  const error = hasDateFilter ? filteredError : allError;

  // Get properties based on whether date filter is active
  const properties = hasDateFilter ? filteredProperties : allProperties;

  // Apply client-side filters only when using allProperties (no date filter)
  const displayedProperties = hasDateFilter
    ? (properties || [])
    : (properties || [])
      .filter(property => {
        const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = propertyType === 'all' || property.type === propertyType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.base_price_per_night - b.base_price_per_night;
          case 'price-high':
            return b.base_price_per_night - a.base_price_per_night;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'featured':
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });

  const handleBookNow = (property: Property) => {
    setSelectedProperty(property);
    setBookingDialogOpen(true);
  };

  const clearDateFilter = () => {
    searchParams.delete('checkIn');
    searchParams.delete('checkOut');
    setSearchParams(searchParams);
  };

  // Get unique property types from all available properties
  const { data: allPropertiesForTypes } = useProperties({ status: 'available' });
  const propertyTypes = [...new Set(allPropertiesForTypes?.map(p => p.type) || [])];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with glass effect on scroll handled by component */}
      <Header />

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with standard CSS approach */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${propertiesHero})`,
          }}
        >
          {/* Exact triple-layer overlay from Home Page for perfect consistency */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent opacity-90" />
        </div>

        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
            <span className="text-accent uppercase tracking-[0.4em] font-bold text-xs mb-4 block animate-fade-in-delay-1">
              Curated Residences
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-[1.1] animate-fade-in-delay-1">
              Find Your Perfect <span className="italic font-light text-white/90">Stay.</span>
            </h1>
            <p className="font-body text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-delay-2">
              Browse our exclusive collection of premium apartments and experience unmatched luxury in the heart of Uyo.
            </p>
          </div>

          {/* Luxury Search Integration */}
          <div className="max-w-5xl mx-auto animate-fade-in-delay-2">
            <AvailabilitySearch
              initialCheckIn={checkIn ? parseISO(checkIn) : undefined}
              initialCheckOut={checkOut ? parseISO(checkOut) : undefined}
            />
          </div>
        </div>
      </section>

      {/* Filter Section - Floating with glass effect */}
      <section className="sticky top-20 z-30 py-6 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent transition-colors group-focus-within:text-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-transparent border-border/50 focus:border-accent/50 rounded-none font-body text-sm"
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-full md:w-[200px] h-12 bg-transparent border-border/50 focus:ring-1 focus:ring-accent rounded-none">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Residences</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px] h-12 bg-transparent border-border/50 focus:ring-1 focus:ring-accent rounded-none">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-accent" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured Collection</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Guest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Subtle background texture or element */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load properties. Please try again later.</p>
            </div>
          ) : displayedProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {hasDateFilter
                  ? 'No properties available for the selected dates.'
                  : searchQuery || propertyType !== 'all'
                    ? 'No properties match your search criteria.'
                    : 'No properties available at the moment.'}
              </p>
              {(searchQuery || propertyType !== 'all' || hasDateFilter) && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setPropertyType('all');
                    if (hasDateFilter) clearDateFilter();
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  Showing {displayedProperties.length} {displayedProperties.length === 1 ? 'property' : 'properties'}
                  {hasDateFilter && ' available for your selected dates'}
                </p>
                {hasDateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="text-muted-foreground hover:text-foreground h-8"
                  >
                    Clear Dates
                  </Button>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedProperties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onBookNow={handleBookNow}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />

      {/* Booking Dialog */}
      {selectedProperty && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          property={selectedProperty}
          initialCheckIn={hasDateFilter ? checkIn : undefined}
          initialCheckOut={hasDateFilter ? checkOut : undefined}
        />
      )}
    </div>
  );
};

export default PublicProperties;
