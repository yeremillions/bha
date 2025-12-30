import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, Users, Shield, Sparkles, ArrowRight, Star } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Manage your four luxurious 2-bedroom duplex apartments with ease and elegance.',
    },
    {
      icon: Calendar,
      title: 'Guest Bookings',
      description: 'Streamlined booking system for seamless guest experiences and maximized occupancy.',
    },
    {
      icon: Users,
      title: 'Staff Coordination',
      description: 'Unified dashboard for housekeeping, maintenance, and facility management teams.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control for admins, housekeepers, maintenance, and bar staff.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">BHA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="font-body">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="font-body bg-accent text-accent-foreground hover:bg-accent/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-body text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Boutique Property Management
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in-delay-1">
              Elevate Your
              <span className="block text-accent">Property Experience</span>
            </h1>
            
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-delay-2">
              BHA delivers sophisticated property management for our exclusive collection of 
              four 2-bedroom duplex apartments. Where luxury meets seamless operations.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-3">
              <Link to="/auth">
                <Button size="lg" className="font-body bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-body px-8 py-6 text-base border-primary/20">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              A comprehensive suite of tools designed for modern property management excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="hover-lift border-border/50 bg-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="font-display text-5xl font-bold text-accent mb-2">4</div>
              <div className="font-body text-muted-foreground">Luxury Duplexes</div>
            </div>
            <div className="p-8 border-y md:border-y-0 md:border-x border-border">
              <div className="font-display text-5xl font-bold text-accent mb-2">5</div>
              <div className="font-body text-muted-foreground">Staff Roles</div>
            </div>
            <div className="p-8">
              <div className="font-display text-5xl font-bold text-accent mb-2">24/7</div>
              <div className="font-body text-muted-foreground">Management Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-accent fill-accent" />
                ))}
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="font-body text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
              Join BHA and experience the difference that thoughtful design and powerful tools can make.
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                className="font-body bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-base"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">BHA</span>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              © {new Date().getFullYear()} BHA Property Management. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;