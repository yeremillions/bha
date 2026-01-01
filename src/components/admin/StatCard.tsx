import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon: LucideIcon;
  variant?: 'default' | 'gold' | 'navy' | 'success' | 'purple';
}

const variantStyles = {
  default: {
    bg: 'from-primary/3 to-primary/5',
    icon: 'bg-primary/10 text-primary',
    accent: 'bg-primary',
  },
  gold: {
    bg: 'from-accent/3 to-accent/8',
    icon: 'bg-accent/15 text-accent',
    accent: 'bg-accent',
  },
  navy: {
    bg: 'from-navy/3 to-navy/5',
    icon: 'bg-navy/10 text-navy dark:bg-navy-light/20 dark:text-cream',
    accent: 'bg-navy dark:bg-navy-light',
  },
  success: {
    bg: 'from-emerald-500/3 to-emerald-500/5',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accent: 'bg-emerald-500',
  },
  purple: {
    bg: 'from-violet-500/3 to-violet-500/5',
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    accent: 'bg-violet-500',
  },
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  variant = 'default' 
}: StatCardProps) => {
  const styles = variantStyles[variant];
  
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br p-6 transition-all duration-500 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1',
      styles.bg
    )}>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-accent/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Accent line */}
      <div className={cn('absolute left-0 top-0 h-full w-1 rounded-l-2xl', styles.accent)} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            styles.icon
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                trend.positive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              )}
            >
              <span className={cn(
                'text-[10px]',
                trend.positive ? '↑' : '↓'
              )} />
              {trend.value}
            </span>
          )}
        </div>
        
        {/* Value */}
        <div className="mb-1">
          <p className="text-3xl font-display font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        
        {/* Title & Subtitle */}
        <p className="text-sm font-medium text-foreground/80 mb-1">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      
      {/* Bottom sparkline decoration */}
      <svg 
        className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-20" 
        preserveAspectRatio="none"
        viewBox="0 0 400 64"
      >
        <defs>
          <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 48 Q50 32 100 40 T200 36 T300 28 T400 32 L400 64 L0 64 Z"
          fill={`url(#grad-${variant})`}
          className="opacity-30"
        />
        <path
          d="M0 48 Q50 32 100 40 T200 36 T300 28 T400 32"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          className="opacity-50"
        />
      </svg>
    </div>
  );
};
