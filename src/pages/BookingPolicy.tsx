
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Calendar, Clock, RotateCcw, ShieldCheck, Home } from 'lucide-react';

const BookingPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-primary text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary to-primary" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-[1px] w-12 bg-accent" />
                            <span className="text-accent tracking-[0.2em] font-body text-sm uppercase font-medium">
                                Guest Information
                            </span>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.1] mb-6">
                            Booking <span className="italic font-light text-white/80">Policy.</span>
                        </h1>
                        <p className="font-body text-lg text-white/60 max-w-2xl font-light leading-relaxed">
                            Transparency and clarity are the foundations of our service. Please review our booking and stay policies designed to ensure a seamless experience for all guests.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto space-y-20">

                        {/* Check-in / Out */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Clock className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Arrival & Departure</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Check-in: 2:00 PM</h3>
                                    <p className="font-body text-muted-foreground leading-relaxed font-light">
                                        Early check-in is subject to availability and may incur an additional fee. Please contact our concierge team at least 24 hours in advance to request early arrival.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Check-out: 12:00 PM</h3>
                                    <p className="font-body text-muted-foreground leading-relaxed font-light">
                                        To ensure we can prepare our residences for arriving guests, we kindly request departures by noon. Late check-out requests are subject to availability.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Cancellation */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <RotateCcw className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Cancellation</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <p>
                                    We understand that plans can change. Our cancellation policy is designed to be fair to both our guests and our operations team.
                                </p>
                                <ul className="space-y-4 list-disc pl-5 marker:text-accent">
                                    <li><strong>Full Refund:</strong> Cancellations made at least 48 hours prior to the scheduled check-in time will receive a 100% refund of the booking amount.</li>
                                    <li><strong>Partial Refund:</strong> Cancellations made between 24 and 48 hours before check-in will be eligible for a 50% refund.</li>
                                    <li><strong>No Refund:</strong> Cancellations made less than 24 hours before check-in, or no-shows, are non-refundable.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Security Deposit */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <ShieldCheck className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Security & Safety</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Refundable Security Deposit</h3>
                                    <p>
                                        A security deposit may be required upon check-in. This amount is fully refundable upon check-out, provided no damages have occurred to the property or its contents during the stay.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Identification Requirement</h3>
                                    <p>
                                        For security reasons and in compliance with local regulations, all primary guests must provide a valid government-issued ID (Passport, National ID, or Driver's License) during the check-in process.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* House Rules */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Home className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">House Rules</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <p>
                                    To maintain the high standard of comfort and luxury for all our guests, we kindly ask you to adhere to the following rules:
                                </p>
                                <ul className="space-y-3 grid sm:grid-cols-2 gap-x-8">
                                    <li className="flex items-center gap-2 italic font-medium text-primary/80">No Smoking Indoors</li>
                                    <li className="flex items-center gap-2 italic font-medium text-primary/80">No Pets Allowed</li>
                                    <li className="flex items-center gap-2 italic font-medium text-primary/80">Quiet Hours: 10 PM - 7 AM</li>
                                    <li className="flex items-center gap-2 italic font-medium text-primary/80">No Parties or Large Events</li>
                                    <li className="flex items-center gap-2 italic font-medium text-primary/80">Maximum Occupancy Enforced</li>
                                    <li className="flex items-center gap-2 italic font-medium text-primary/80">Respect the Neighborhood</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BookingPolicy;
