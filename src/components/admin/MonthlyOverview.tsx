import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { label: 'Total Bookings', value: '45' },
  { label: 'Accommodation Revenue', value: '₦1,950,000' },
  { label: 'Bar Revenue', value: '₦315,000' },
  { label: 'Total Revenue', value: '₦2,265,000' },
];

export const MonthlyOverview = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg bg-muted/50 p-4"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
