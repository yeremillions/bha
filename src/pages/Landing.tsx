import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Calendar, 
  RefreshCw, 
  Zap, 
  Percent, 
  Shield, 
  Headphones,
  Star,
  MapPin,
  Wifi,
  Clock,
  Lock,
  ChevronDown,
  ArrowRight,
  Flame,
  Search,
  Mail
} from 'lucide-react';
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
import davidOkonkwoHeadshot from '@/assets/david-okonkwo-headshot.jpg';
import sarahEzeHeadshot from '@/assets/sarah-eze-headshot.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const handleCheckAvailability = () => {
    if (checkIn && checkOut) {
      const params = new URLSearchParams();
      params.set('checkIn', checkIn);
      params.set('checkOut', checkOut);
      navigate(`/properties?${params.toString()}`);
    }
  };

  const handleClearSearch = () => {
    setHasSearched(false);
    setCheckIn('');
    setCheckOut('');
  };
  const trustBadges = [
    { icon: Shield, label: 'Verified Properties' },
    { icon: Lock, label: 'Secure Payments' },
    { icon: Headphones, label: '24/7 Support' },
  ];

  const features = [
    {
      icon: RefreshCw,
      title: 'Flexible Cancellation',
      description: 'Cancel anytime',
    },
    {
      icon: Zap,
      title: 'Same-Day Booking',
      description: 'Book today, check-in today',
    },
    {
      icon: Percent,
      title: 'Corporate Discounts',
      description: 'Special business rates',
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
    },
    {
      icon: Wifi,
      title: 'Modern Amenities',
      description: 'High-speed WiFi, AC, fully equipped kitchens, and more',
    },
    {
      icon: Clock,
      title: 'Flexible Booking',
      description: 'Book for a night, week, or month with competitive rates',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: '24/7 security, verified properties, and trusted host',
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

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-primary/75" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <Link to="#properties">
              <Button variant="outline" className="mb-8 bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20">
                Check Availability
              </Button>
            </Link>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Brooklyn Hills Apartment
              <span className="block text-accent">Luxury Meets Comfort</span>
            </h1>

            <p className="font-body text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Experience the perfect blend of luxury and comfort with our premium shortlet apartments in the heart of Uyo. Perfect for business trips, vacations, and extended stays.
            </p>
            
            {/* Booking Form */}
            <Card className="max-w-3xl mx-auto bg-background/95 backdrop-blur-md shadow-xl">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="font-body text-sm text-muted-foreground">Check-in</label>
                    <Input 
                      type="date" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-sm text-muted-foreground">Check-out</label>
                    <Input 
                      type="date" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <Button 
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10"
                    onClick={handleCheckAvailability}
                    disabled={!checkIn || !checkOut}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Check Availability
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rating Badge */}
            <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 rounded-full bg-primary/80 backdrop-blur-sm">
              <span className="font-display font-bold">4.8/5</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                ))}
              </div>
              <span className="font-body text-sm text-primary-foreground/80">from 150+ guests</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 border-b border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-muted-foreground">
                <badge.icon className="h-5 w-5" />
                <span className="font-body text-sm">{badge.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-accent">
              <Flame className="h-5 w-5" />
              <span className="font-body text-sm font-medium">12 properties booked today</span>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Results - shows when user searches */}
      {hasSearched && checkIn && checkOut && (
        <AvailabilityResults 
          ref={resultsRef}
          checkIn={checkIn} 
          checkOut={checkOut} 
          onClear={handleClearSearch}
        />
      )}

      {/* Featured Apartments - Now uses real database data */}
      <FeaturedApartments />

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="font-body text-muted-foreground text-lg">
              Book your perfect apartment in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent font-display text-2xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="font-body text-muted-foreground mb-6">Simple, fast, and secure — start your booking now</p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              View Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Guests Say
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our guests have to say about their experiences at Brooklyn Hills Apartments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="bg-card border-border/70">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="font-body text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="font-body text-sm text-muted-foreground">{testimonial.location}</p>
                      <p className="font-body text-xs text-muted-foreground">{testimonial.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-20 lg:py-32 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Brooklyn Hills?
            </h2>
            <p className="font-body text-muted-foreground text-lg">
              Experience premium living with our carefully curated apartments and exceptional service
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, index) => (
              <Card key={item.title} className="bg-card border-border/70 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-body text-muted-foreground text-lg">
              Find answers to common questions about booking, payments, and our services.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="font-display font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
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
