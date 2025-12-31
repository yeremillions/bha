import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, Clock, AlertCircle, User2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const tasks = [
  { property: 'Property #1', assignee: 'Mary Obi', status: 'in_progress', progress: 65 },
  { property: 'Property #4', assignee: 'Unassigned', status: 'pending', progress: 0 },
  { property: 'Property #2', assignee: 'Grace Eze', status: 'completed', progress: 100 },
];

const statusConfig = {
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    style: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    progress: 'bg-sky-500',
  },
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    progress: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    progress: 'bg-emerald-500',
  },
};

export const HousekeepingTasks = () => {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalProgress = Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length);
  
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Housekeeping</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedCount}/{tasks.length} tasks completed
          </p>
        </div>
        <Link 
          to="/dashboard/housekeeping" 
          className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 group"
        >
          View All 
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      
      {/* Overall progress */}
      <div className="px-6 py-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
          <span className="text-xs font-bold text-foreground">{totalProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent to-gold-light transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* Tasks list */}
      <div className="divide-y divide-border/50">
        {tasks.map((task, index) => {
          const config = statusConfig[task.status as keyof typeof statusConfig];
          const StatusIcon = config.icon;
          
          return (
            <div
              key={index}
              className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
            >
              {/* Status icon */}
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
                task.status === 'completed' ? 'bg-emerald-500/20' : 
                task.status === 'in_progress' ? 'bg-sky-500/20' : 'bg-amber-500/20'
              )}>
                <StatusIcon className={cn(
                  'h-5 w-5',
                  task.status === 'completed' ? 'text-emerald-500' : 
                  task.status === 'in_progress' ? 'text-sky-500' : 'text-amber-500'
                )} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">{task.property}</p>
                  <Badge 
                    variant="outline" 
                    className={cn('text-[10px] px-1.5 py-0', config.style)}
                  >
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <User2 className="h-3 w-3 text-muted-foreground" />
                  <p className={cn(
                    'text-xs',
                    task.assignee === 'Unassigned' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                  )}>
                    {task.assignee}
                  </p>
                </div>
              </div>
              
              {/* Progress */}
              <div className="w-20 shrink-0">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{task.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn('h-full transition-all duration-500', config.progress)}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
