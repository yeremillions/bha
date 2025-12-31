import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const bookings = [
  { name: 'Folake Adeyemi', property: 'Luxury Penthouse', amount: '₦450,000', status: 'confirmed' },
  { name: 'Ibrahim Musa', property: 'Family Home', amount: '₦650,000', status: 'pending' },
  { name: 'Grace Okonkwo', property: 'Executive Studio', amount: '₦220,000', status: 'confirmed' },
];

export const RecentBookings = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Recent Bookings</CardTitle>
        <Link 
          to="/dashboard/bookings" 
          className="text-sm text-accent hover:text-accent/80 font-medium"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium text-sm">{booking.name}</p>
              <p className="text-xs text-muted-foreground">{booking.property}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{booking.amount}</p>
              <Badge 
                variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {booking.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
