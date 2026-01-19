import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const Landing = () => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

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
      image: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&q=80',
      quote: 'Perfect for my business trip to Uyo! The apartment was spotless, WiFi was excellent, and the location couldn\'t be better. Brooklyn Hills exceeded all my expectations.',
    },
    {
      name: 'Sarah Eze',
      location: 'Port Harcourt, Nigeria',
      date: 'December 2024',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Brooklyn Hills</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#properties" className="font-body text-muted-foreground hover:text-foreground transition-colors">Properties</a>
            <a href="#about" className="font-body text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="font-body text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="font-body">Login</Button>
            </Link>
            <Link to="/auth">
              <Button className="font-body bg-accent text-accent-foreground hover:bg-accent/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

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
              Premium Shortlet Apartments
              <span className="block text-accent">in the heart of Uyo</span>
            </h1>
            
            <p className="font-body text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Experience comfort and luxury with our fully furnished apartments. Perfect for business trips, vacations, and extended stays.
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
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-10">
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
            >
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="py-20 lg:py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="font-body text-muted-foreground mb-8">
              Get exclusive deals, new property listings, and travel tips delivered to your inbox.
            </p>
            <div className="flex gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 bg-background"
              />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Building2 className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="font-display text-xl font-semibold">Brooklyn Hills</span>
              </div>
              <p className="font-body text-primary-foreground/70 mb-6">
                Premium shortlet apartments in Uyo, Nigeria. Experience comfort and luxury with our fully furnished accommodations.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#properties" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">Properties</a></li>
                <li><a href="#about" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">About Us</a></li>
                <li><a href="#contact" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact</a></li>
                <li><Link to="/auth" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-6">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">FAQs</a></li>
                <li><a href="#" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">Cancellation Policy</a></li>
                <li><a href="#" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="font-body text-primary-foreground/70">Brooklyn Hills Estate, Uyo, Akwa Ibom, Nigeria</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent shrink-0" />
                  <a href="mailto:info@brooklynhills.ng" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">info@brooklynhills.ng</a>
                </li>
                <li className="flex items-center gap-3">
                  <Headphones className="h-5 w-5 text-accent shrink-0" />
                  <a href="tel:+2348012345678" className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">+234 801 234 5678</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-primary-foreground/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-body text-sm text-primary-foreground/60">
                © {new Date().getFullYear()} Brooklyn Hills Apartment. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Terms</a>
                <a href="#" className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Privacy</a>
                <a href="#" className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
