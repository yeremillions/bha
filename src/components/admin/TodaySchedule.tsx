import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const checkIns = [
  { name: 'Adebayo Johnson', property: 'Luxury 3-Bedroom Penthouse', time: '2:00 PM' },
  { name: 'Chioma Okafor', property: 'Executive Studio', time: '3:30 PM' },
];

const checkOuts = [
  { name: 'Tunde Williams', property: 'Cozy 2-Bedroom Apartment', time: '12:00 PM' },
];

export const TodaySchedule = () => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Check-ins */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownToLine className="h-4 w-4 text-green-500" />
            <h4 className="font-semibold text-sm">Check-ins</h4>
          </div>
          <div className="space-y-3">
            {checkIns.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.property}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.time}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Check-outs */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpFromLine className="h-4 w-4 text-orange-500" />
            <h4 className="font-semibold text-sm">Check-outs</h4>
          </div>
          <div className="space-y-3">
            {checkOuts.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.property}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.time}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
