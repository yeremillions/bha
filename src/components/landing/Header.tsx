import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-none transition-colors",
            isTransparent ? "bg-white/20 group-hover:bg-[#D4AF37]" : "bg-[#D4AF37]"
          )}>
            <Building2 className={cn("h-5 w-5 transition-colors", isTransparent ? "text-white" : "text-black")} />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-display text-2xl font-medium tracking-tight leading-none transition-colors",
              isTransparent ? "text-white" : "text-foreground"
            )}>
              Brooklyn Hills
            </span>
            <span className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-medium mt-1 transition-colors",
              isTransparent ? "text-white/60" : "text-muted-foreground"
            )}>
              Residences
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: 'Residences', path: '/properties' },
            { name: 'Experience', path: '/#about' },
            { name: 'Concierge', path: '/#contact' }
          ].map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={cn(
                "font-body text-sm font-medium transition-colors uppercase tracking-widest hover:text-[#D4AF37]",
                isTransparent ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button
              variant="ghost"
              className={cn(
                "font-body uppercase tracking-wider text-xs font-bold hover:bg-white/10",
                isTransparent ? "text-white hover:text-[#D4AF37]" : "text-foreground"
              )}
            >
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <Button className={cn(
              "font-body uppercase tracking-wider text-xs font-bold rounded-none px-6 transition-all hover:scale-105",
              isTransparent
                ? "bg-white text-black hover:bg-[#D4AF37] hover:text-white border-none"
                : "bg-[#D4AF37] text-black hover:bg-black hover:text-[#D4AF37]"
            )}>
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
