import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { AvailabilityResults } from '@/components/landing/AvailabilityResults';
import { AvailabilitySearch } from '@/components/booking/AvailabilitySearch';
import { parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

            <main className="pt-24">
                {/* Search Bar Section - High contrast dark background */}
                <section className="bg-[#020408] py-8 border-b border-white/5">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto">
                            <AvailabilitySearch
                                initialCheckIn={checkIn ? parseISO(checkIn) : undefined}
                                initialCheckOut={checkOut ? parseISO(checkOut) : undefined}
                                className="bg-background shadow-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                {checkIn && checkOut ? (
                    <AvailabilityResults
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onClear={handleClearSearch}
                    />
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

            <NewsletterSection />
            <Footer />
        </div>
    );
};

export default SearchResults;
