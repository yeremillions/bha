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
  ChartBar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  title: string;
  url: string;
  icon: any;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Property Management',
    items: [
      { title: 'Properties', url: '/dashboard/properties', icon: Home },
      { title: 'Bookings', url: '/dashboard/bookings', icon: BookOpen, badge: 3 },
      { title: 'Calendar', url: '/dashboard/calendar', icon: Calendar },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Housekeeping', url: '/dashboard/housekeeping', icon: Sparkles, badge: 5 },
      { title: 'Maintenance', url: '/dashboard/maintenance', icon: Wrench, badge: 2 },
      { title: 'Bar Management', url: '/dashboard/bar', icon: Wine },
    ],
  },
  {
    title: 'Business',
    items: [
      { title: 'Customers', url: '/dashboard/customers', icon: Users },
      { title: 'Financial', url: '/dashboard/financial', icon: DollarSign },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', url: '/dashboard/settings', icon: Settings },
    ],
  },
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
          'fixed left-0 top-0 h-screen transition-transform duration-300',
          // Desktop: always visible, can be collapsed, lower z-index
          'lg:block lg:transition-all lg:z-10',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile: slide in/out based on mobileOpen, higher z-index
          'lg:translate-x-0 z-50',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'w-64' // Mobile always full width when open
        )}
      >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
      </div>
      
      <div className="relative h-full flex flex-col">
        {/* Logo */}
        <div className={cn(
          'flex h-20 items-center border-b border-accent/20 px-6',
          collapsed && 'lg:justify-center lg:px-4'
        )}>
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onMobileClose}>
            <div className="relative flex h-10 w-10 items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent via-gold to-gold-light animate-pulse-glow shadow-lg shadow-accent/50" />
              <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-navy border border-accent/30">
                <Building2 className="h-5 w-5 text-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-cream drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Brooklyn</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Hills</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-cream/70 hover:text-accent hover:bg-white/10 hover:shadow-lg hover:shadow-accent/20 transition-all"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5 hover:rotate-90 transition-transform" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <TooltipProvider delayDuration={0}>
            <div className="space-y-6">
              {navSections.map((section, sectionIndex) => (
                <div key={section.title} className="space-y-1">
                  {/* Section header */}
                  {!collapsed && (
                    <h3 className="px-4 text-[10px] uppercase tracking-wider text-gold/70 font-bold mb-2 drop-shadow-sm">
                      {section.title}
                    </h3>
                  )}
                  {collapsed && sectionIndex > 0 && (
                    <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent my-2 mx-4" />
                  )}

                  {/* Section items */}
                  {section.items.map((item) => {
                    const active = isActive(item.url);
                    const navLink = (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={onMobileClose}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                          active
                            ? 'text-navy bg-gradient-to-r from-accent via-gold to-gold-light shadow-xl shadow-accent/50 border border-gold/30'
                            : 'text-cream/80 hover:text-cream hover:bg-white/10 hover:shadow-lg hover:shadow-accent/20'
                        )}
                      >
                        {/* Active indicator */}
                        {active && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-full bg-gradient-to-b from-accent to-gold shadow-lg shadow-accent/50 animate-pulse" />
                        )}

                        <div className="relative">
                          <item.icon className={cn(
                            'h-5 w-5 shrink-0 transition-all duration-200',
                            active
                              ? 'text-navy drop-shadow-md'
                              : 'text-cream/70 group-hover:text-accent group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                          )} />

                          {/* Badge indicator */}
                          {item.badge && (
                            <span className={cn(
                              'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shadow-lg',
                              active ? 'bg-navy text-accent border border-accent/50' : 'bg-rose-500 text-white animate-pulse shadow-rose-500/50'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {!collapsed && (
                          <span className="truncate flex-1">{item.title}</span>
                        )}

                        {!collapsed && item.badge && (
                          <span className={cn(
                            'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-md',
                            active
                              ? 'bg-navy/30 text-navy border border-navy/50'
                              : 'bg-rose-500 text-white shadow-rose-500/50 animate-pulse'
                          )}>
                            {item.badge}
                          </span>
                        )}

                        {/* Hover glow */}
                        {!active && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/0 via-accent/20 to-gold/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        )}

                        {/* Shimmer effect on hover */}
                        {!active && (
                          <div className="absolute inset-0 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          </div>
                        )}
                      </Link>
                    );

                    // Wrap with tooltip when collapsed
                    if (collapsed) {
                      return (
                        <Tooltip key={item.title}>
                          <TooltipTrigger asChild>
                            {navLink}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-navy border-accent/30 shadow-xl">
                            <p className="font-medium text-cream">{item.title}</p>
                            {item.badge && (
                              <p className="text-xs text-gold font-semibold">{item.badge} pending</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return navLink;
                  })}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-accent/20 p-3">
          <TooltipProvider delayDuration={0}>
            {/* Back to Website */}
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/"
                    onClick={onMobileClose}
                    className="group flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-cream/70 hover:text-cream hover:bg-white/10 hover:shadow-lg hover:shadow-accent/20 transition-all duration-200"
                  >
                    <Home className="h-5 w-5 shrink-0 group-hover:text-accent group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-navy border-accent/30 shadow-xl">
                  <p className="font-medium text-cream">Back to Website</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                to="/"
                onClick={onMobileClose}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-cream/70 hover:text-cream hover:bg-white/10 hover:shadow-lg hover:shadow-accent/20 transition-all duration-200"
              >
                <Home className="h-5 w-5 shrink-0 group-hover:text-accent group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all" />
                <span>Back to Website</span>
              </Link>
            )}

            {/* Collapse toggle - Desktop only */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'mt-2 w-full justify-center text-cream/70 hover:text-accent hover:bg-white/10 hover:shadow-lg hover:shadow-accent/20 hidden lg:flex transition-all duration-200 border border-transparent hover:border-accent/20',
                    collapsed && 'px-0'
                  )}
                  onClick={onToggle}
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 drop-shadow-sm" />
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1 drop-shadow-sm" />
                      <span>Collapse</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-navy border-accent/30 shadow-xl">
                  <p className="font-medium text-cream">Expand sidebar</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
    </>
  );
};
