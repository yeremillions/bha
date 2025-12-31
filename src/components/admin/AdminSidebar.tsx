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
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
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

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shrink-0">
            <Building2 className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-semibold">Brooklyn Hills</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 shrink-0', collapsed && 'hidden')}
          onClick={onToggle}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.url)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Back to Website */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          )}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Back to Website</span>}
        </Link>
      </div>
    </aside>
  );
};
