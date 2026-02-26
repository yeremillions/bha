
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FileText, Scale, Gavel, UserCheck, AlertTriangle } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-primary text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary to-primary" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-[1px] w-12 bg-accent" />
                            <span className="text-accent tracking-[0.2em] font-body text-sm uppercase font-medium">
                                Legal Agreement
                            </span>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.1] mb-6">
                            Terms & <span className="italic font-light text-white/80">Conditions.</span>
                        </h1>
                        <p className="font-body text-lg text-white/60 max-w-2xl font-light leading-relaxed">
                            Please read these terms and conditions carefully as they form a legally binding agreement between you and Brooklyn Hills Apartment.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto space-y-20">

                        {/* Introduction */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <FileText className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Overview</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 font-body text-muted-foreground leading-relaxed font-light">
                                <p className="mb-6">
                                    Welcome to Brooklyn Hills Apartment. By accessing our website and using our booking services, you agree to comply with and be bound by the following terms and conditions of use.
                                </p>
                                <p>
                                    The term 'Brooklyn Hills Apartment' or 'us' or 'we' refers to the owner of the website. The term 'you' refers to the user or viewer of our website or the guest booking our residences.
                                </p>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Use of Service */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <UserCheck className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Booking</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Age Requirement</h3>
                                    <p>The primary guest must be at least 18 years of age to book a residence and occupy the premises without a parent or legal guardian.</p>
                                </div>
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Payment Terms</h3>
                                    <p>Full payment is required at the time of booking to secure your reservation. Payments are processed securely via Paystack. Your booking is only confirmed upon successful receipt of payment.</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Liability */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <AlertTriangle className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Liability</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <p>
                                    Brooklyn Hills Apartment shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services or for the cost of procurement of substitute goods and services.
                                </p>
                                <p>
                                    We are not responsible for the loss or damage of any personal belongings left in the premises. Guests are encouraged to utilize the provided security features and maintain personal insurance coverage.
                                </p>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-border/50" />

                        {/* Goverining Law */}
                        <div className="grid md:grid-cols-3 gap-10 items-start">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <Gavel className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-2xl text-primary">Legal</h2>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6 font-body text-muted-foreground leading-relaxed font-light">
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Governing Law</h3>
                                    <p>Your use of this website and any dispute arising out of such use of the website is subject to the laws of the Federal Republic of Nigeria.</p>
                                </div>
                                <div>
                                    <h3 className="font-display text-lg text-primary mb-2">Modifications</h3>
                                    <p>We reserve the right to modify these terms and conditions at any time. Any changes will be updated on this page and will take effect immediately upon posting.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Terms;
