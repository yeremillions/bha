import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import logo from '@/assets/logo.png';

export const Footer = () => {
  return (
    <footer className="py-20 bg-[#020408] text-white border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-8">
              <img
                src={logo}
                alt="Brooklyn Hills"
                className="h-24 w-auto object-contain opacity-90"
              />
            </div>
            <p className="font-body text-white/60 mb-8 leading-relaxed text-sm">
              Experience the pinnacle of luxury living in Uyo. Our curated residences offer unmatched comfort, security, and style for the discerning traveler.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all duration-300 group">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all duration-300 group">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all duration-300 group">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-[#D4AF37] mb-8">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/properties" className="font-body text-sm text-white/60 hover:text-white transition-colors">Our Residences</Link></li>
              <li><a href="/#about" className="font-body text-sm text-white/60 hover:text-white transition-colors">The Standard</a></li>
              <li><a href="/#contact" className="font-body text-sm text-white/60 hover:text-white transition-colors">Concierge</a></li>
              <li><Link to="/auth" className="font-body text-sm text-white/60 hover:text-white transition-colors">Guest Portal</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg text-[#D4AF37] mb-8">Support</h4>
            <ul className="space-y-4">
              <li><a href="/#common-questions" className="font-body text-sm text-white/60 hover:text-white transition-colors">Common Questions</a></li>
              <li><a href="#" className="font-body text-sm text-white/60 hover:text-white transition-colors">Booking Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-[#D4AF37] mb-8">Contact</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#D4AF37] mt-0.5 shrink-0" strokeWidth={1.5} />
                <span className="font-body text-sm text-white/60 leading-relaxed">33 Chief Udo Eno Street,<br />Akpasak Estate, Besides Customs Office,<br />Oron Road Uyo, Akwa Ibom State.</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <a href="mailto:bookings@brooklynhillsapartment.com" className="font-body text-sm text-white/60 hover:text-white transition-colors">bookings@brooklynhillsapartment.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <a href="tel:+2349135057221" className="font-body text-sm text-white/60 hover:text-white transition-colors">+234 913 505 7221</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-white/40 tracking-wide">
              © {new Date().getFullYear()} BROOKLYN HILLS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-8">
              <a href="#" className="font-body text-xs text-white/40 hover:text-[#D4AF37] transition-colors uppercase tracking-wider">Terms</a>
              <a href="#" className="font-body text-xs text-white/40 hover:text-[#D4AF37] transition-colors uppercase tracking-wider">Privacy</a>
              <a href="#" className="font-body text-xs text-white/40 hover:text-[#D4AF37] transition-colors uppercase tracking-wider">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
