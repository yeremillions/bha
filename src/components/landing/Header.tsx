import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ContactModal } from './ContactModal';
import logo from '@/assets/logo.png';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header is transparent only on Landing page when not scrolled
  const isTransparent = isLanding && !isScrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isTransparent
          ? "bg-transparent border-transparent py-6"
          : "bg-background/95 backdrop-blur-md border-border/40 py-4 shadow-sm"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative transition-all duration-300">
            <img
              src={logo}
              alt="Brooklyn Hills"
              className="h-20 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: 'Apartments', path: '/#properties' },
            { name: 'The Standard', path: '/#the-standard' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "font-body text-sm font-medium transition-colors uppercase tracking-widest hover:text-[#D4AF37]",
                isTransparent ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}

          <ContactModal>
            <button
              className={cn(
                "font-body text-sm font-medium transition-colors uppercase tracking-widest hover:text-[#D4AF37]",
                isTransparent ? "text-white/80" : "text-muted-foreground"
              )}
            >
              Contact
            </button>
          </ContactModal>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button
              variant="ghost"
              className={cn(
                "font-body uppercase tracking-wider text-xs font-bold transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10 hover:text-[#D4AF37]"
                  : "text-foreground hover:bg-black hover:text-white"
              )}
            >
              Login
            </Button>
          </Link>
          <a href="/#hero-heading">
            <Button className={cn(
              "font-body uppercase tracking-wider text-xs font-bold rounded-none px-6 transition-all hover:scale-105",
              isTransparent
                ? "bg-white text-black hover:bg-[#D4AF37] hover:text-white border-none"
                : "bg-[#D4AF37] text-black hover:bg-black hover:text-[#D4AF37]"
            )}>
              Book Now
            </Button>
          </a>
        </div>
      </div>
    </nav >
  );
};
