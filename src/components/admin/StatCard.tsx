import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  chartColor?: string;
}

export const StatCard = ({ title, value, subtitle, trend, icon: Icon, chartColor = 'stroke-accent' }: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="mb-2">
          <p className="text-3xl font-display font-bold text-foreground">{value}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{subtitle}</span>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                trend.positive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        {/* Mini chart visualization */}
        <svg className="absolute bottom-0 left-0 right-0 h-12 w-full" preserveAspectRatio="none">
          <path
            d="M0,40 Q30,35 60,30 T120,25 T180,20 T240,15 T300,18 T360,12"
            fill="none"
            className={cn('opacity-30', chartColor)}
            strokeWidth="2"
          />
        </svg>
      </CardContent>
    </Card>
  );
};
