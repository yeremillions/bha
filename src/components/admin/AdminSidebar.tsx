import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Home,
  BookOpen,
  Calendar,
  Sparkles,
  Wine,
  Wrench,
  Users,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Properties', url: '/dashboard/properties', icon: Home },
  { title: 'Bookings', url: '/dashboard/bookings', icon: BookOpen },
  { title: 'Calendar', url: '/dashboard/calendar', icon: Calendar },
  { title: 'Housekeeping', url: '/dashboard/housekeeping', icon: Sparkles },
  { title: 'Bar Management', url: '/dashboard/bar', icon: Wine },
  { title: 'Maintenance', url: '/dashboard/maintenance', icon: Wrench },
  { title: 'Customers', url: '/dashboard/customers', icon: Users },
  { title: 'Financial', url: '/dashboard/financial', icon: DollarSign },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export const AdminSidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen transition-transform duration-300',
          // Desktop: always visible, can be collapsed
          'lg:block lg:transition-all',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile: slide in/out based on mobileOpen
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'w-64' // Mobile always full width when open
        )}
      >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy to-navy-light" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />
      </div>
      
      <div className="relative h-full flex flex-col">
        {/* Logo */}
        <div className={cn(
          'flex h-20 items-center border-b border-white/10 px-6',
          collapsed && 'lg:justify-center lg:px-4'
        )}>
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onMobileClose}>
            <div className="relative flex h-10 w-10 items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent to-gold-light animate-pulse-glow" />
              <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-navy">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-cream">Brooklyn</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Hills</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-cream/60 hover:text-cream hover:bg-white/10"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={onMobileClose}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-navy bg-accent shadow-lg shadow-accent/20'
                      : 'text-cream/70 hover:text-cream hover:bg-white/5'
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-accent" />
                  )}
                  
                  <item.icon className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    active ? 'text-navy' : 'text-cream/60 group-hover:text-accent group-hover:scale-110'
                  )} />
                  
                  {!collapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                  
                  {/* Hover glow */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-3">
          {/* Back to Website */}
          <Link
            to="/"
            onClick={onMobileClose}
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-cream/60 hover:text-cream hover:bg-white/5 transition-all duration-200"
          >
            <Home className="h-5 w-5 shrink-0 group-hover:text-accent transition-colors" />
            {!collapsed && <span>Back to Website</span>}
          </Link>
          
          {/* Collapse toggle - Desktop only */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'mt-2 w-full justify-center text-cream/60 hover:text-cream hover:bg-white/5 hidden lg:flex',
              collapsed && 'px-0'
            )}
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
    </>
  );
};
