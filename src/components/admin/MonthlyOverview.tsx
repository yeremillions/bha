import { TrendingUp, TrendingDown, Building2, Wine, Wallet, CalendarRange } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMonthlyOverview, formatCurrency } from '@/hooks/useMonthlyOverview';
import { Skeleton } from '@/components/ui/skeleton';

export const MonthlyOverview = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useMonthlyOverview();

  const stats = [
    { 
      label: 'Total Bookings', 
      value: isLoading ? null : String(data?.totalBookings ?? 0), 
      change: data?.bookingsChange ?? '+0',
      icon: Building2,
      color: 'from-sky-500/20 to-sky-500/5',
      iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-500/20',
    },
    { 
      label: 'Accommodation', 
      value: isLoading ? null : formatCurrency(data?.accommodationRevenue ?? 0), 
      change: data?.accommodationChange ?? '0%',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20',
    },
    { 
      label: 'Bar Revenue', 
      value: isLoading ? null : formatCurrency(data?.barRevenue ?? 0), 
      change: data?.barChange ?? '0%',
      icon: Wine,
      color: 'from-violet-500/20 to-violet-500/5',
      iconColor: 'text-violet-600 dark:text-violet-400 bg-violet-500/20',
    },
    { 
      label: 'Total Revenue', 
      value: isLoading ? null : formatCurrency(data?.totalRevenue ?? 0), 
      change: data?.totalChange ?? '0%',
      icon: Wallet,
      color: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent bg-accent/20',
    },
  ];

  const weeklyData = data?.weeklyRevenueData ?? [0, 0, 0, 0, 0, 0, 0];
  const totalChange = data?.totalChange ?? '0%';
  const isPositiveTrend = totalChange.startsWith('+') && totalChange !== '+0%';

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">Monthly Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? 'Loading...' : `${data?.currentMonthLabel} performance`}
            </p>
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
            {isLoading ? (
              <Skeleton className="h-6 w-14 rounded-full" />
            ) : (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full',
                isPositiveTrend 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
              )}>
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-xs font-semibold">{totalChange}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const changeIsPositive = stat.change.startsWith('+') && stat.change !== '+0' && stat.change !== '+0%';
            
            return (
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
                  {isLoading ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <>
                      <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                      <span className={cn(
                        'text-[10px] font-semibold mb-1',
                        changeIsPositive 
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      )}>
                        {stat.change}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Chart */}
      <div className="px-6 pb-6">
        <div className="relative h-32 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 overflow-hidden">
          {/* Bar chart visualization */}
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 h-20">
            {weeklyData.map((height, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t-sm bg-gradient-to-t from-accent to-gold-light transition-all duration-500 hover:opacity-80"
                style={{ height: `${Math.max(height, 5)}%` }}
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
