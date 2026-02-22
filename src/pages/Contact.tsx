
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { MapPin, Mail, Phone, Clock, Send } from 'lucide-react';
import conciergeBanner from '@/assets/concierge-banner.png';

const Contact = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const data = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                message: formData.get('message') as string,
            };

            const { error } = await supabase.functions.invoke('send-contact-email', {
                body: data,
            });

            if (error) throw error;

            toast({
                title: "Message Sent",
                description: "Our concierge team will contact you shortly.",
                className: "bg-[#020408] text-white border-white/10",
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Failed to send",
                description: "Please try again later or contact us directly.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero Banner Section */}
            <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${conciergeBanner})`,
                        backgroundPosition: '50% 25%'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-black/20" />
                </div>
                <div className="container mx-auto px-6 h-full relative z-10 flex flex-col justify-end pb-12">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6 animate-fade-in">
                            <div className="h-[1px] w-12 bg-accent" />
                            <span className="text-accent tracking-[0.2em] font-body text-sm uppercase font-medium">
                                Professional Concierge
                            </span>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.1] text-white animate-fade-in-delay-1">
                            At Your <span className="italic font-light text-white/80">Service.</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* Sub-header Content */}
            <section className="py-16 bg-primary text-primary-foreground border-b border-border">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="font-display text-3xl md:text-4xl font-medium mb-6 text-white animate-fade-in-delay-1">
                            Get in Touch <span className="italic font-light text-white/80">with us.</span>
                        </h2>
                        <p className="font-body text-lg text-primary-foreground/70 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-delay-2">
                            Whether you're planning a romantic getaway, a business trip, or a family vacation,
                            we're here to ensure your stay at Brooklyn Hills is nothing short of exceptional.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">

                        {/* Contact Information */}
                        <div className="space-y-12 animate-fade-in-delay-1">
                            <div>
                                <h2 className="font-display text-3xl text-primary mb-8 underline decoration-accent/30 decoration-offset-8">Get in Touch</h2>
                                <p className="font-body text-muted-foreground leading-relaxed mb-10">
                                    Whether you're planning a romantic getaway, a business trip, or a family vacation,
                                    we're here to ensure your stay at Brooklyn Hills is nothing short of exceptional.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-8">
                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-accent transition-colors">
                                        <MapPin className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-display text-lg text-primary mb-2">Location</h4>
                                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                                            33 Chief Udo Eno Street, Akpasak Estate,<br />
                                            Besides Customs Office, Oron Road Uyo,<br />
                                            Akwa Ibom State, Nigeria.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-accent transition-colors">
                                        <Mail className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-display text-lg text-primary mb-2">Concierge Email</h4>
                                        <a href="mailto:concierge@brooklynhillsapartment.com" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors leading-relaxed">
                                            concierge@brooklynhillsapartment.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-accent transition-colors">
                                        <Phone className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-display text-lg text-primary mb-2">Reservations</h4>
                                        <a href="tel:+2349135057221" className="font-body text-sm text-muted-foreground hover:text-accent transition-colors leading-relaxed">
                                            +234 913 505 7221
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-accent transition-colors">
                                        <Clock className="h-5 w-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-display text-lg text-primary mb-2">Response Time</h4>
                                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                                            Our team typically responds to inquiries within 2 hours during business operations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 md:p-12 border border-border shadow-sm relative overflow-hidden animate-fade-in-delay-2">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -mr-16 -mt-16" />

                            <h3 className="font-display text-2xl text-primary mb-8">Send a Message</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-widest">Full Name</Label>
                                        <Input id="name" name="name" required className="rounded-none bg-background border-border text-foreground focus:ring-accent/50 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-widest">Email Address</Label>
                                        <Input id="email" name="email" type="email" required className="rounded-none bg-background border-border text-foreground focus:ring-accent/50 h-12" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-muted-foreground text-xs uppercase tracking-widest">Phone Number (Optional)</Label>
                                    <Input id="phone" name="phone" type="tel" className="rounded-none bg-background border-border text-foreground focus:ring-accent/50 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-muted-foreground text-xs uppercase tracking-widest">Message</Label>
                                    <Textarea id="message" name="message" required className="rounded-none bg-background border-border text-foreground focus:ring-accent/50 min-h-[150px] resize-none" />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-accent text-white hover:bg-primary transition-all duration-300 rounded-none h-14 font-bold uppercase tracking-[0.2em] text-xs"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Send Message <Send className="h-3 w-3" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
