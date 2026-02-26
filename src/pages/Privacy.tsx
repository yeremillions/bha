
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Lock, Eye, Database, Cookie, Mail } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-primary text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary to-primary" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-[1px] w-12 bg-accent" />
                            <span className="text-accent tracking-[0.2em] font-body text-sm uppercase font-medium">
                                Data Protection
                            </span>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.1] mb-6">
                            Privacy <span className="italic font-light text-white/80">Policy.</span>
                        </h1>
                        <p className="font-body text-lg text-white/60 max-w-2xl font-light leading-relaxed">
                            Your privacy is paramount. This policy outlines how we handle and protect your personal data in accordance with international standards.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto space-y-20">

                        {/* Data Collection */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Eye className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Collection</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <p>
                                    When you book with Brooklyn Hills Apartment, we collect information necessary to fulfill your reservation and provide a personalized experience.
                                </p>
                                <ul className="space-y-4 list-disc pl-5 marker:text-accent">
                                    <li><strong>Personal Identification:</strong> Name, email address, phone number, and mailing address.</li>
                                    <li><strong>Booking Details:</strong> Travel dates, property selection, and special requests.</li>
                                    <li><strong>Verification Data:</strong> Government-issued ID for check-in verification (not stored permanently).</li>
                                    <li><strong>Payment Information:</strong> Processed directly by our payment partner (Paystack); we do not store full card details.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Use of Data */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Database className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Information Use</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <p>
                                    Your data is used exclusively to enhance your stay and manage our relationship with you.
                                </p>
                                <ul className="space-y-4 list-disc pl-5 marker:text-accent">
                                    <li>To process and confirm your reservations.</li>
                                    <li>To communicate essential stay information and updates.</li>
                                    <li>To improve our website and customer service.</li>
                                    <li>To send promotional materials (only if you have opted in).</li>
                                </ul>
                                <p className="italic font-medium text-primary/80">
                                    We will never sell or rent your personal information to third parties.
                                </p>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Security */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Lock className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Security</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <p>
                                    We implement a variety of security measures to maintain the safety of your personal information. These include encrypted data storage, secure server protocols, and regular security audits.
                                </p>
                                <p>
                                    Access to your personal data is restricted to authorized personnel who need the information to perform their duties.
                                </p>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Cookies */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Cookie className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Cookies</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 font-body text-muted-foreground leading-relaxed font-light">
                                <p className="mb-6">
                                    Our website uses cookies to enhance your browsing experience. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your web browser.
                                </p>
                                <p>
                                    They help us remember and process the items in your booking summary and understand your preferences for future visits. You can choose to turn off all cookies via your browser settings.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Privacy;
