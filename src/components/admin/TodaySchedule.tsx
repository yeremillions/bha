import { Badge } from '@/components/ui/badge';
import { ArrowDownToLine, ArrowUpFromLine, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const schedule = [
  { 
    type: 'check-in',
    name: 'Adebayo Johnson', 
    property: 'Luxury 3-Bedroom Penthouse', 
    time: '2:00 PM',
    avatar: 'AJ',
  },
  { 
    type: 'check-in',
    name: 'Chioma Okafor', 
    property: 'Executive Studio', 
    time: '3:30 PM',
    avatar: 'CO',
  },
  { 
    type: 'check-out',
    name: 'Tunde Williams', 
    property: 'Cozy 2-Bedroom Apartment', 
    time: '12:00 PM',
    avatar: 'TW',
  },
];

export const TodaySchedule = () => {
  const checkIns = schedule.filter(s => s.type === 'check-in');
  const checkOuts = schedule.filter(s => s.type === 'check-out');
  
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Today's Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {schedule.length} activities planned
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">{checkIns.length} Check-ins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">{checkOuts.length} Check-outs</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 space-y-4">
        {schedule.map((item, index) => {
          const isCheckIn = item.type === 'check-in';
          
          return (
            <div
              key={index}
              className={cn(
                'group relative flex items-center gap-4 rounded-xl p-4 transition-all duration-300 hover:shadow-md',
                isCheckIn 
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10' 
                  : 'bg-amber-500/5 hover:bg-amber-500/10'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl font-display font-bold text-sm shrink-0 transition-transform duration-300 group-hover:scale-105',
                isCheckIn 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              )}>
                {item.avatar}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">{item.property}</p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'shrink-0 gap-1.5',
                      isCheckIn 
                        ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                        : 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {isCheckIn ? (
                      <ArrowDownToLine className="h-3 w-3" />
                    ) : (
                      <ArrowUpFromLine className="h-3 w-3" />
                    )}
                    {item.time}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
