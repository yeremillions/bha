import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { AvailabilityResults } from '@/components/landing/AvailabilityResults';
import { AvailabilitySearch } from '@/components/booking/AvailabilitySearch';
import { parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import propertiesHero from '@/assets/properties-hero.jpg';
import searchResultsHero from '@/assets/search-results-hero.jpg';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';

    const handleClearSearch = () => {
        navigate('/properties');
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main>
                {/* Cinematic Hero Section - Replicated from PublicProperties for perfect visibility */}
                <section id="availability-search-section" className="relative min-h-[50vh] flex items-center pt-20 overflow-hidden">
                    {/* Background Image with standard CSS approach */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${searchResultsHero})`,
                        }}
                    >
                        {/* Exact triple-layer overlay from Home/Properties Page for perfect consistency */}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent opacity-90" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 py-16">
                        <div className="max-w-4xl mx-auto text-center mb-10 animate-fade-in">
                            <span className="text-accent uppercase tracking-[0.4em] font-bold text-xs mb-4 block">
                                Availability Search
                            </span>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 leading-[1.1]">
                                Exclusive <span className="italic font-light text-white/90">Availability.</span>
                            </h1>
                        </div>

                        {/* Luxury Search Integration - Non-compact glass style */}
                        <div className="max-w-5xl mx-auto animate-fade-in-delay-1">
                            <AvailabilitySearch
                                initialCheckIn={checkIn ? parseISO(checkIn) : undefined}
                                initialCheckOut={checkOut ? parseISO(checkOut) : undefined}
                                className="bg-white/10 backdrop-blur-md border hover:border-white/30 transition-all duration-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                {checkIn && checkOut ? (
                    <div className="animate-fade-in-delay-2">
                        <AvailabilityResults
                            checkIn={checkIn}
                            checkOut={checkOut}
                            onClear={handleClearSearch}
                        />
                    </div>
                ) : (
                    <section className="py-20 text-center">
                        <div className="container mx-auto px-6">
                            <h2 className="font-display text-2xl mb-4 text-foreground">Please select dates to search</h2>
                            <p className="text-muted-foreground mb-8">Choose your arrival and departure dates to see available luxury apartments.</p>
                            <button
                                onClick={() => navigate('/')}
                                className="text-accent underline underline-offset-4 font-medium"
                            >
                                Back to Home
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default SearchResults;
