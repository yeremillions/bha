import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tasks = [
  { property: 'Property #1', assignee: 'Mary Obi', status: 'in_progress' },
  { property: 'Property #4', assignee: 'Unassigned', status: 'pending' },
  { property: 'Property #2', assignee: 'Grace Eze', status: 'completed' },
];

const statusStyles = {
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const statusLabels = {
  in_progress: 'In Progress',
  pending: 'Pending',
  completed: 'Completed',
};

export const HousekeepingTasks = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Housekeeping Tasks</CardTitle>
        <Link 
          to="/dashboard/housekeeping" 
          className="text-sm text-accent hover:text-accent/80 font-medium"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium text-sm">{task.property}</p>
              <p className="text-xs text-muted-foreground">{task.assignee}</p>
            </div>
            <Badge 
              className={cn('text-xs', statusStyles[task.status as keyof typeof statusStyles])}
            >
              {statusLabels[task.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
