import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '@/hooks/useProperties';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { BookingDialog } from '@/components/booking/BookingDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Star,
    MapPin,
    Bed,
    Bath,
    Users,
    ShieldCheck,
    Zap,
    Wifi,
    Wind,
    UtensilsCrossed,
    Droplets,
    Car,
    Tv,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel';

const PublicPropertyDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: property, isLoading, error } = useProperty(id);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-accent" />
                        <p className="text-muted-foreground font-body">Loading your luxury stay...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="font-display text-4xl font-bold">Residence Not Found</h1>
                        <p className="text-muted-foreground max-w-md">The property you are looking for may have been moved or is currently unavailable.</p>
                        <Button onClick={() => navigate('/properties')}>View All Properties</Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const amenityIcons: Record<string, { icon: any; label: string }> = {
        'security': { icon: ShieldCheck, label: '24/7 Security' },
        '24/7 Security': { icon: ShieldCheck, label: '24/7 Security' },
        'power': { icon: Zap, label: 'Backup Power Supply' },
        'Backup Power Supply': { icon: Zap, label: 'Backup Power Supply' },
        'wifi': { icon: Wifi, label: 'High-Speed Wi-Fi' },
        'High-Speed Wi-Fi': { icon: Wifi, label: 'High-Speed Wi-Fi' },
        'Air Conditioning': { icon: Wind, label: 'Air Conditioning' },
        'ac': { icon: Wind, label: 'Air Conditioning' },
        'Fully Equipped Kitchen': { icon: UtensilsCrossed, label: 'Fully Equipped Kitchen' },
        'kitchen': { icon: UtensilsCrossed, label: 'Fully Equipped Kitchen' },
        'Water Heater': { icon: Droplets, label: 'Water Heater' },
        'water_heater': { icon: Droplets, label: 'Water Heater' },
        'Parking Space': { icon: Car, label: 'Parking Space' },
        'parking': { icon: Car, label: 'Parking Space' },
        'Smart TV/DSTV': { icon: Tv, label: 'Smart TV/DSTV' },
        'entertainment': { icon: Tv, label: 'Smart TV/DSTV' },
    };

    const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Gallery Section */}
            <section className="relative pt-20">
                <div className="aspect-[21/9] w-full overflow-hidden bg-muted group">
                    <Carousel setApi={setCarouselApi} className="w-full h-full">
                        <CarouselContent className="-ml-0 h-full">
                            {images.map((image, index) => (
                                <CarouselItem key={index} className="pl-0 h-full">
                                    <div className="relative w-full h-full">
                                        <img
                                            src={image}
                                            alt={`${property.name} - ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {images.length > 1 && (
                            <>
                                <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => carouselApi?.scrollPrev()}
                                        className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => carouselApi?.scrollNext()}
                                        className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => carouselApi?.scrollTo(index)}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-300",
                                                index === currentSlide ? "w-8 bg-accent" : "w-1.5 bg-white/50"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </Carousel>
                </div>
            </section>

            <section className="py-12 lg:py-20">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge variant="outline" className="text-accent border-accent/30 uppercase tracking-[0.2em] font-bold text-[10px] rounded-sm py-1">
                                        {property.type}
                                    </Badge>
                                    {property.featured && (
                                        <Badge className="bg-[#D4AF37] text-white border-transparent uppercase tracking-[0.2em] font-bold text-[10px] rounded-sm py-1">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-6 tracking-tight">
                                    {property.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-body">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-accent" />
                                        <span>{property.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-[#D4AF37] fill-[#D4AF37]" />
                                        <span className="font-medium text-foreground">{property.rating || 4.5}</span>
                                        <span className="text-sm">({property.review_count || 0} Reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Bed className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Bedrooms</span>
                                    </div>
                                    <p className="text-lg font-medium">{property.bedrooms}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Bath className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Bathrooms</span>
                                    </div>
                                    <p className="text-lg font-medium">{property.bathrooms}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Max Guests</span>
                                    </div>
                                    <p className="text-lg font-medium">{property.max_guests}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Check className="h-4 w-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Status</span>
                                    </div>
                                    <p className="text-lg font-medium capitalize">{property.status}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="font-display text-2xl font-medium border-l-4 border-accent pl-4">About this residence</h2>
                                <p className="font-body text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                                    {property.description || "Experience unparalleled luxury in this meticulously designed residence. Every detail has been curated to provide a premium living experience, combining modern comfort with sophisticated aesthetics."}
                                </p>
                            </div>

                            <div className="space-y-8">
                                <h2 className="font-display text-2xl font-medium border-l-4 border-accent pl-4">Amenities</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {property.amenities?.map((amenity) => {
                                        const mapping = amenityIcons[amenity];
                                        if (!mapping) return null;
                                        const Icon = mapping.icon;
                                        return (
                                            <div key={amenity} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-border/40 group hover:border-accent/40 transition-colors">
                                                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                                                    <Icon className="h-5 w-5 text-accent" />
                                                </div>
                                                <span className="font-medium">{mapping.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Booking Sidebar */}
                        <div className="relative">
                            <div className="sticky top-32">
                                <Card className="border-border/50 bg-card overflow-hidden shadow-xl shadow-accent/5">
                                    <CardContent className="p-8">
                                        <div className="mb-8">
                                            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Price per night</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-display text-4xl font-bold text-accent">
                                                    {formatPrice(property.base_price_per_night)}
                                                </span>
                                                <span className="text-muted-foreground text-sm">/ night</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/40">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <span className="text-sm font-medium">Available for booking</span>
                                            </div>
                                            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
                                                <p className="text-xs text-accent font-bold uppercase tracking-widest">Guest Policy</p>
                                                <p className="text-sm text-muted-foreground">Max capacity: {property.max_guests} guests</p>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-bold tracking-widest uppercase transition-all hover:scale-[1.02] shadow-lg shadow-accent/20"
                                            onClick={() => setBookingDialogOpen(true)}
                                        >
                                            Reserve Now
                                        </Button>

                                        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
                                            Secure your luxury stay at Brooklyn Hills Apartment. Our team will verify your booking within 24 hours.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {bookingDialogOpen && (
                <BookingDialog
                    open={bookingDialogOpen}
                    onOpenChange={setBookingDialogOpen}
                    property={property}
                />
            )}
        </div>
    );
};

export default PublicPropertyDetails;
