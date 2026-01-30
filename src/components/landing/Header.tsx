import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Building2 className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-semibold tracking-tight leading-tight">Brooklyn Hills</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Luxury Meets Comfort</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/properties" 
            className="font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Properties
          </Link>
          <a 
            href="/#about" 
            className="font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
          <a 
            href="/#contact" 
            className="font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </a>
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
  );
};
