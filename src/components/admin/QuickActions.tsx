import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  Wrench, 
  Sparkles, 
  Wine 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  { title: 'Add Property', icon: Plus, href: '/dashboard/properties' },
  { title: 'View Bookings', icon: BookOpen, href: '/dashboard/bookings' },
  { title: 'Manage Calendar', icon: Calendar, href: '/dashboard/calendar' },
  { title: 'Report Issue', icon: Wrench, href: '/dashboard/maintenance' },
  { title: 'Assign Cleaning', icon: Sparkles, href: '/dashboard/housekeeping' },
  { title: 'Record Bar Sale', icon: Wine, href: '/dashboard/bar' },
];

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-4 text-center transition-colors hover:bg-muted hover:border-accent"
            >
              <action.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{action.title}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
