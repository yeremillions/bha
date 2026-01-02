import { TrendingUp, Building2, Wine, Wallet, CalendarRange } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const stats = [
  { 
    label: 'Total Bookings', 
    value: '45', 
    change: '+8',
    icon: Building2,
    color: 'from-sky-500/20 to-sky-500/5',
    iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-500/20',
  },
  { 
    label: 'Accommodation', 
    value: '₦1.95M', 
    change: '+12%',
    icon: TrendingUp,
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20',
  },
  { 
    label: 'Bar Revenue', 
    value: '₦315K', 
    change: '+18%',
    icon: Wine,
    color: 'from-violet-500/20 to-violet-500/5',
    iconColor: 'text-violet-600 dark:text-violet-400 bg-violet-500/20',
  },
  { 
    label: 'Total Revenue', 
    value: '₦2.27M', 
    change: '+15%',
    icon: Wallet,
    color: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent bg-accent/20',
  },
];

export const MonthlyOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">Monthly Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">December 2024 performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/reports')}
              className="gap-1.5 text-xs h-7"
            >
              <CalendarRange className="h-3 w-3" />
              Custom Period
            </Button>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-semibold">+15%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'group relative rounded-xl p-4 bg-gradient-to-br transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
                stat.color
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg mb-3 transition-transform duration-300 group-hover:scale-110',
                stat.iconColor
              )}>
                <stat.icon className="h-4 w-4" />
              </div>
              
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
                {stat.label}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chart placeholder */}
      <div className="px-6 pb-6">
        <div className="relative h-32 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 overflow-hidden">
          {/* Simple bar chart visualization */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 h-20">
            {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t-sm bg-gradient-to-t from-accent to-gold-light transition-all duration-500 hover:opacity-80"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="absolute inset-x-4 bottom-1 flex justify-between text-[8px] text-muted-foreground">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day} className="flex-1 text-center">{day}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
