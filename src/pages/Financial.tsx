import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingDown, 
  Clock, 
  TrendingUp,
  Download,
  Building2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data
const revenueBreakdown = [
  { label: 'Accommodation', amount: 1950000, percentage: 84.4, color: 'bg-accent' },
  { label: 'Bar Sales', amount: 315000, percentage: 13.6, color: 'bg-violet-500' },
  { label: 'Other Services', amount: 45000, percentage: 2, color: 'bg-sky-500' },
];

const expenseBreakdown = [
  { label: 'Staff Salaries', amount: 250000, percentage: 34.2, color: 'bg-red-500' },
  { label: 'Housekeeping', amount: 180000, percentage: 24.7, color: 'bg-orange-500' },
  { label: 'Utilities', amount: 120000, percentage: 16.4, color: 'bg-amber-500' },
  { label: 'Maintenance', amount: 95000, percentage: 13, color: 'bg-emerald-500' },
  { label: 'Supplies', amount: 85000, percentage: 11.6, color: 'bg-blue-500' },
];

const propertyPerformance = [
  { name: 'Luxury 3-Bedroom Penthouse', bookings: 12, occupancy: 85, avgRate: 45000, revenue: 540000 },
  { name: 'Family 4-Bedroom Home', bookings: 8, occupancy: 72, avgRate: 65000, revenue: 520000 },
  { name: 'Cozy 2-Bedroom Apartment', bookings: 15, occupancy: 90, avgRate: 28000, revenue: 420000 },
  { name: 'Executive Studio', bookings: 10, occupancy: 68, avgRate: 22000, revenue: 220000 },
];

const monthlyTrend = [
  { month: 'Jul', revenue: 1850000, expenses: 680000, profit: 1170000, margin: 63.2 },
  { month: 'Aug', revenue: 2100000, expenses: 720000, profit: 1380000, margin: 65.7 },
  { month: 'Sep', revenue: 1920000, expenses: 695000, profit: 1225000, margin: 63.8 },
  { month: 'Oct', revenue: 2250000, expenses: 750000, profit: 1500000, margin: 66.7 },
  { month: 'Nov', revenue: 2180000, expenses: 710000, profit: 1470000, margin: 67.4 },
  { month: 'Dec', revenue: 2310000, expenses: 730000, profit: 1580000, margin: 68.4 },
];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  }
  return `₦${(amount / 1000).toFixed(0)}K`;
};

const formatFullCurrency = (amount: number) => {
  return `₦${amount.toLocaleString()}`;
};

const Financial = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState('this-month');

  const totalRevenue = 2310000;
  const totalExpenses = 730000;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background font-body">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <AdminHeader />
        
        <main className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Financial Overview
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track revenue, expenses, and profitability
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <DollarSign className="h-4 w-4 text-accent" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatFullCurrency(totalRevenue)}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    9.9%
                  </span>
                  <span className="text-xs text-muted-foreground">vs avg month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Total Expenses</span>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-2xl font-display font-bold text-destructive">
                  {formatFullCurrency(totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  31.6% of revenue
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Net Profit</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                  {formatFullCurrency(netProfit)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                  {profitMargin}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Healthy margin
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <DollarSign className="h-5 w-5 text-accent" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {revenueBreakdown.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">{formatFullCurrency(item.amount)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Revenue</span>
                  <span className="font-bold text-accent text-lg">{formatFullCurrency(totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {expenseBreakdown.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">{formatFullCurrency(item.amount)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Expenses</span>
                  <span className="font-bold text-destructive text-lg">{formatFullCurrency(totalExpenses)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Performance */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <Building2 className="h-5 w-5 text-accent" />
                Property Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {propertyPerformance.map((property) => (
                <div 
                  key={property.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">{property.name}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Bookings: <span className="text-foreground font-medium">{property.bookings}</span></span>
                      <span className="flex items-center gap-2">
                        Occupancy: 
                        <Progress value={property.occupancy} className="w-16 h-1.5" />
                        <span className="text-foreground font-medium">{property.occupancy}%</span>
                      </span>
                      <span>Avg Rate: <span className="text-foreground font-medium">{formatFullCurrency(property.avgRate)}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold text-accent">{formatFullCurrency(property.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 6-Month Trend */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                6-Month Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {monthlyTrend.map((month) => (
                  <div 
                    key={month.month}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-center space-y-3"
                  >
                    <h4 className="font-display font-bold text-foreground">{month.month}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Revenue</span>
                      </div>
                      <p className="font-medium text-foreground">{formatCurrency(month.revenue)}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expenses</span>
                      </div>
                      <p className="font-medium text-destructive">{formatCurrency(month.expenses)}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Profit</span>
                      </div>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(month.profit)}</p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-sm font-bold text-accent">{month.margin}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Financial;
