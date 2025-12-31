import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  Wrench, 
  Sparkles, 
  Wine,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  { 
    title: 'New Property', 
    description: 'Add listing',
    icon: Plus, 
    href: '/dashboard/properties',
    color: 'from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  { 
    title: 'Bookings', 
    description: 'View all',
    icon: BookOpen, 
    href: '/dashboard/bookings',
    color: 'from-sky-500/20 to-sky-500/5 hover:from-sky-500/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  { 
    title: 'Calendar', 
    description: 'Schedule',
    icon: Calendar, 
    href: '/dashboard/calendar',
    color: 'from-violet-500/20 to-violet-500/5 hover:from-violet-500/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  { 
    title: 'Maintenance', 
    description: 'Report issue',
    icon: Wrench, 
    href: '/dashboard/maintenance',
    color: 'from-amber-500/20 to-amber-500/5 hover:from-amber-500/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  { 
    title: 'Housekeeping', 
    description: 'Assign task',
    icon: Sparkles, 
    href: '/dashboard/housekeeping',
    color: 'from-rose-500/20 to-rose-500/5 hover:from-rose-500/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  { 
    title: 'Bar Sales', 
    description: 'Record sale',
    icon: Wine, 
    href: '/dashboard/bar',
    color: 'from-accent/20 to-accent/5 hover:from-accent/30',
    iconColor: 'text-accent',
  },
];

export const QuickActions = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-semibold text-foreground">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className={cn(
              'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-br p-5 text-center transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 hover:border-accent/30',
              action.color
            )}
          >
            {/* Hover arrow */}
            <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 shadow-sm transition-transform duration-300 group-hover:scale-110',
              action.iconColor
            )}>
              <action.icon className="h-6 w-6" />
            </div>
            
            <div>
              <p className="font-semibold text-sm text-foreground">{action.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
