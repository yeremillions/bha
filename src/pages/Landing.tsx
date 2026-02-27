import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDateSelection } from '@/hooks/useDateSelection';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AvailabilitySearch } from '@/components/booking/AvailabilitySearch';
import { IconContainer } from '@/components/ui/IconContainer';
import {
  MapPin,
  WifiHigh,
  Calendar as CalendarIcon,
  Shield,
  Headphones,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Lock,
  Lightning,
  Percent,
  ArrowsClockwise,
  Building,
  Flame,
  MagnifyingGlass,
  EnvelopeSimple,
} from '@phosphor-icons/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FeaturedApartments } from '@/components/landing/FeaturedApartments';
import { AvailabilityResults } from '@/components/landing/AvailabilityResults';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/landing/Header';
import { cn } from '@/lib/utils';
import davidOkonkwoHeadshot from '@/assets/david-okonkwo-headshot.jpg';
import sarahEzeHeadshot from '@/assets/sarah-eze-headshot.jpg';
import heroBg from '@/assets/hero-bg.jpg';
import standardFeature from '@/assets/standard-feature.jpg';

// Fallback Images (Unsplash)
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3270&auto=format&fit=crop';
const STANDARD_FALLBACK = 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80';

const Landing = () => {
  const navigate = useNavigate();
  const { checkIn, checkOut } = useDateSelection();
  const resultsRef = useRef<HTMLElement>(null);

  // Image State with Fallbacks
  const [currentHeroBg, setCurrentHeroBg] = useState(heroBg);
  const [currentStandardFeature, setCurrentStandardFeature] = useState(standardFeature);

  // Validate Hero Image Load
  useEffect(() => {
    const img = new Image();
    img.src = heroBg;
    img.onerror = () => {
      console.warn('Local hero image failed to load, switching to fallback.');
      setCurrentHeroBg(HERO_FALLBACK);
    };
  }, []);

  // Get today at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSearch = () => {
    // Navigation is handled by AvailabilitySearch component
  };
  const trustBadges = [
    {
      icon: Shield,
      label: 'Verified Properties',
      variant: 'emerald' as const
    },
    {
      icon: Lock,
      label: 'Secure Payments',
      variant: 'blue' as const
    },
    {
      icon: Headphones,
      label: '24/7 Support',
      variant: 'violet' as const
    },
  ];

  const features = [
    {
      icon: ArrowsClockwise,
      title: 'Flexible Cancellation',
      description: 'Cancel anytime',
      variant: 'blue' as const,
    },
    {
      icon: Lightning,
      title: 'Same-Day Booking',
      description: 'Book today, check-in today',
      variant: 'amber' as const,
    },
    {
      icon: Percent,
      title: 'Corporate Discounts',
      description: 'Special business rates',
      variant: 'emerald' as const,
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Search & Compare',
      description: 'Browse our premium apartments to find your perfect match.',
    },
    {
      number: '02',
      title: 'Book Securely',
      description: 'Select your dates and complete your booking with our secure payment system.',
    },
    {
      number: '03',
      title: 'Check-in & Enjoy',
      description: 'Receive confirmation and enjoy a comfortable stay at Brooklyn Hills.',
    },
  ];

  const testimonials = [
    {
      name: 'Chioma Adeyemi',
      location: 'Lagos, Nigeria',
      date: 'November 2024',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
      quote: 'Absolutely stunning apartment! The attention to detail was impeccable. The bar access was a fantastic touch, and the staff were incredibly welcoming. Will definitely be returning!',
    },
    {
      name: 'David Okonkwo',
      location: 'Abuja, Nigeria',
      date: 'October 2024',
      image: davidOkonkwoHeadshot,
      quote: 'Perfect for my business trip to Uyo! The apartment was spotless, WiFi was excellent, and the location couldn\'t be better. Brooklyn Hills exceeded all my expectations.',
    },
    {
      name: 'Sarah Eze',
      location: 'Port Harcourt, Nigeria',
      date: 'December 2024',
      image: sarahEzeHeadshot,
      quote: 'My family and I had an amazing week here! The kids loved the pool, and we appreciated how well-equipped the kitchen was. True luxury at a reasonable price.',
    },
  ];

  const whyChoose = [
    {
      icon: MapPin,
      title: 'Premium Locations',
      description: 'Strategically located properties in prime areas across Nigeria',
      variant: 'blue' as const,
    },
    {
      icon: WifiHigh,
      title: 'Modern Amenities',
      description: 'High-speed WiFi, AC, fully equipped kitchens, and more',
      variant: 'emerald' as const,
    },
    {
      icon: CalendarIcon,
      title: 'Flexible Booking',
      description: 'Book for a night, week, or month with competitive rates',
      variant: 'violet' as const,
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: '24/7 security, verified properties, and trusted host',
      variant: 'amber' as const,
    },
  ];

  const faqs = [
    {
      question: 'How do I book an apartment?',
      answer: 'Simply browse our available properties, select your preferred dates, and complete the booking process. You can pay securely online via Paystack with your debit card or bank transfer.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major debit cards, bank transfers, and online payments through Paystack. All payments are processed securely in Nigerian Naira (₦).',
    },
    {
      question: 'Can I cancel or modify my booking?',
      answer: 'Yes! We offer flexible cancellation. You can cancel or modify your booking up to 24 hours before check-in for a full refund. Contact us for specific terms.',
    },
    {
      question: 'What is the check-in and check-out time?',
      answer: 'Standard check-in is from 2:00 PM and check-out is by 12:00 PM. Early check-in or late check-out may be available upon request, subject to availability.',
    },
    {
      question: 'Are the apartments fully furnished?',
      answer: 'Yes! All our apartments are fully furnished with modern amenities including WiFi, AC, fully equipped kitchen, TV, and quality linens. Some properties also include bar access.',
    },
    {
      question: 'Do you offer corporate discounts?',
      answer: 'Yes, we offer special rates for corporate bookings and long-term stays. Contact our team to discuss customized packages for your business needs.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section - Cinematic Luxury */}
      <section className="relative h-screen min-h-[800px] flex flex-col justify-end pb-20 overflow-hidden">
        {/* Background Image with Cinematic Zoom Effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-scale-slow"
          style={{
            backgroundImage: `url(${currentHeroBg})`,
          }}
        >
          {/* Global Darkener */}
          <div className="absolute inset-0 bg-black/20" />
          {/* Multi-layer Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent opacity-90" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl">
            {/* Elegant Tagline */}
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div className="h-[1px] w-12 bg-[#D4AF37]" />
              <span className="text-[#D4AF37] tracking-[0.2em] font-body text-sm uppercase font-medium">
                The Art of Living
              </span>
            </div>

            <h1 id="hero-heading" className="font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] mb-8 text-white animate-fade-in-delay-1">
              Brooklyn Hills <br />
              <span className="italic text-white/90 font-light">Residences.</span>
            </h1>

            <p id="booking-intro" className="font-body text-lg md:text-xl text-white/80 max-w-xl mb-12 font-light leading-relaxed animate-fade-in-delay-2">
              Experience the pinnacle of luxury hospitality in Uyo.
              Exquisite apartments designed for the discerning traveler.
            </p>

            {/* Horizontal Booking Bar - Floating Glass */}
            <div id="booking-widget" className="w-full animate-fade-in-delay-3 hidden md:block">
              <AvailabilitySearch />
            </div>

            {/* Mobile Booking Trigger (Visible only on small screens) */}
            <div className="md:hidden mt-8 w-full">
              <Button
                className="w-full h-14 rounded-full bg-[#D4AF37] text-black hover:bg-[#c5a028] font-body uppercase tracking-widest text-sm font-bold shadow-lg"
                onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Book Your Stay
              </Button>
            </div>

            {/* Rating Badge - Minimalist */}
            <div className="inline-flex items-center gap-3 mt-12 animate-fade-in-delay-3 px-6 py-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black/50 bg-gray-300"
                    style={{ backgroundImage: `url(https://randomuser.me/api/portraits/thumb/men/${i + 20}.jpg)`, backgroundSize: 'cover' }} />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-black/50 bg-[#D4AF37] flex items-center justify-center text-[10px] font-bold text-black">
                  4.9
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} weight="fill" className="h-3 w-3 text-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-xs text-white/80 font-light mt-0.5">Trusted by 500+ guests</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Service Strip - Unified & Elegant */}
      <section className="py-10 bg-[#020408] border-b border-white/5 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center justify-center gap-4 group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Shield className="h-6 w-6 text-[#D4AF37]" weight="light" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg text-white">Verified</h3>
                <p className="font-body text-xs text-white/50 uppercase tracking-widest">Properties</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Lock className="h-6 w-6 text-[#D4AF37]" weight="light" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg text-white">Secure</h3>
                <p className="font-body text-xs text-white/50 uppercase tracking-widest">Payments</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Headphones className="h-6 w-6 text-[#D4AF37]" weight="light" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg text-white">24/7</h3>
                <p className="font-body text-xs text-white/50 uppercase tracking-widest">Support</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 group">
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-[#D4AF37]/20 transition-colors">
                <Lightning className="h-6 w-6 text-[#D4AF37]" weight="light" />
              </div>
              <div className="text-left">
                <h3 className="font-display text-lg text-white">Instant</h3>
                <p className="font-body text-xs text-white/50 uppercase tracking-widest">Booking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Apartments - Now uses real database data */}
      <FeaturedApartments />

      {/* How It Works - Elegant Steps */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/3">
              <span className="text-[#D4AF37] font-body text-sm uppercase tracking-[0.2em] mb-4 block">Process</span>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                Seamless <span className="italic text-muted-foreground">Arrival</span>
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                From discovery to check-in, we've refined every step to ensure your journey is as exceptional as your stay.
              </p>
              <Button variant="outline" className="mt-8 border-foreground/20 hover:bg-foreground hover:text-background transition-colors rounded-none px-8">
                Start Booking
              </Button>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "01", title: "Select", desc: "Choose from our curated collection of premium residences." },
                { num: "02", title: "Reserve", desc: "Instant, secure booking with immediate confirmation." },
                { num: "03", title: "Arrive", desc: "Digital check-in and 24/7 concierge support upon arrival." }
              ].map((step) => (
                <div key={step.num} className="group p-6 border-l border-border/50 hover:border-[#D4AF37] transition-colors relative">
                  <span className="text-6xl font-display text-muted-foreground/10 group-hover:text-[#D4AF37]/20 absolute top-4 right-4 transition-colors">
                    {step.num}
                  </span>
                  <h3 className="font-display text-xl text-foreground mb-3 mt-8 group-hover:text-[#D4AF37] transition-colors">{step.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Editorial Style */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 animate-fade-in">
            <span className="text-[#D4AF37] font-body text-sm uppercase tracking-[0.2em] mb-4 block">Reviews</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              Guest <span className="italic text-muted-foreground">Stories</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent/20 group-hover:border-accent transition-colors duration-500 shadow-xl">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1.5 shadow-md">
                    <div className="bg-[#D4AF37] rounded-full p-1">
                      <Star weight="fill" className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>

                <div className="mb-6 text-[#D4AF37]">
                  <Star weight="fill" className="h-4 w-4 inline-block" />
                  <Star weight="fill" className="h-4 w-4 inline-block" />
                  <Star weight="fill" className="h-4 w-4 inline-block" />
                  <Star weight="fill" className="h-4 w-4 inline-block" />
                  <Star weight="fill" className="h-4 w-4 inline-block" />
                </div>
                <p className="font-display text-xl md:text-2xl text-foreground leading-relaxed mb-8 italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-auto">
                  <h4 className="font-body font-bold text-sm uppercase tracking-widest text-foreground">{testimonial.name}</h4>
                  <span className="text-xs text-muted-foreground mt-1 block">{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Brooklyn Standard (Why Choose Us) - Grid Layout */}
      {/* The Brooklyn Standard (Why Choose Us) - Grid Layout */}
      <section id="the-standard" className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#D4AF37] font-body text-sm uppercase tracking-[0.2em] mb-4 block">The Standard</span>
              <h2 className="font-display text-4xl md:text-6xl text-background mb-8 leading-tight">
                Elevated <br />
                <span className="italic text-muted-foreground">Living.</span>
              </h2>
              <p className="font-body text-white/60 text-lg leading-relaxed max-w-md mb-8">
                We don't just offer beds; we curate experiences. Every detail at Brooklyn Hills is chosen to enhance your stay, from the thread count to the concierge service.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-display text-xl text-[#D4AF37] mb-2">Prime Locations</h4>
                  <p className="font-body text-sm text-white/50">Situated in the most desirable districts of Uyo.</p>
                </div>
                <div>
                  <h4 className="font-display text-xl text-[#D4AF37] mb-2">Concierge</h4>
                  <p className="font-body text-sm text-white/50">Personalized service to assist with your every need.</p>
                </div>
                <div>
                  <h4 className="font-display text-xl text-[#D4AF37] mb-2">Smart Living</h4>
                  <p className="font-body text-sm text-white/50">High-speed entertainment and automated systems.</p>
                </div>
                <div>
                  <h4 className="font-display text-xl text-[#D4AF37] mb-2">Security</h4>
                  <p className="font-body text-sm text-white/50">24/7 guarded premises for your peace of mind.</p>
                </div>
              </div>
            </div>

            {/* Visual Element / Image Grid */}
            <div className="relative">
              <div className="aspect-[3/4] bg-muted overflow-hidden relative z-10">
                <img
                  src={currentStandardFeature}
                  className="object-cover w-full h-full opacity-80"
                  alt="Interior"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Prevent infinite loop if fallback also fails
                    if (target.src === STANDARD_FALLBACK) return;
                    console.warn('Local feature image failed to load, switching to fallback.');
                    setCurrentStandardFeature(STANDARD_FALLBACK);
                  }}
                />
                <div className="absolute inset-0 border border-[#D4AF37]/30 m-4" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#D4AF37] z-0 hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Clean & Minimal */}
      <section id="common-questions" className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Common Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-transparent border-b border-border px-0"
              >
                <AccordionTrigger className="font-display text-lg text-foreground hover:text-[#D4AF37] hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-muted-foreground leading-relaxed pb-6 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Book Your Stay?
            </h2>
            <p className="font-body text-primary-foreground/80 text-lg mb-10">
              Explore our available properties and book instantly with secure payment
            </p>
            <Button
              size="lg"
              className="font-body bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-base"
              onClick={() => navigate('/properties')}
            >
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
