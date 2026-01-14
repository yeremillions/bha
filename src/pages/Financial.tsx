import { useState, useMemo } from 'react';
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
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactions, useFinancialSummary } from '@/hooks/useFinancial';
import { useBookings } from '@/hooks/useBookings';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format as formatDate } from 'date-fns';

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`;
  }
  return `₦${(amount / 1000).toFixed(0)}K`;
};

const formatFullCurrency = (amount: number) => {
  return `₦${Math.round(amount).toLocaleString()}`;
};

const categoryLabels: Record<string, string> = {
  // Income
  accommodation: 'Accommodation',
  bar_sales: 'Bar Sales',
  other_services: 'Other Services',
  deposit: 'Deposits',
  additional_charges: 'Additional Charges',
  // Expenses
  staff_salaries: 'Staff Salaries',
  housekeeping: 'Housekeeping',
  utilities: 'Utilities',
  maintenance: 'Maintenance',
  supplies: 'Supplies',
  inventory: 'Inventory',
  marketing: 'Marketing',
  insurance: 'Insurance',
  taxes: 'Taxes',
  other_expenses: 'Other Expenses',
};

const categoryColors: Record<string, string> = {
  // Income
  accommodation: 'bg-accent',
  bar_sales: 'bg-violet-500',
  other_services: 'bg-sky-500',
  deposit: 'bg-emerald-500',
  additional_charges: 'bg-blue-500',
  // Expenses
  staff_salaries: 'bg-red-500',
  housekeeping: 'bg-orange-500',
  utilities: 'bg-amber-500',
  maintenance: 'bg-emerald-500',
  supplies: 'bg-blue-500',
  inventory: 'bg-purple-500',
  marketing: 'bg-pink-500',
  insurance: 'bg-indigo-500',
  taxes: 'bg-yellow-500',
  other_expenses: 'bg-gray-500',
};

const Financial = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [period, setPeriod] = useState('this-month');

  // Calculate date range based on selected period
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'last-month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'this-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStart, 1);
        end = now;
        break;
      case 'this-year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'this-month':
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }

    return {
      startDate: formatDate(start, 'yyyy-MM-dd'),
      endDate: formatDate(end, 'yyyy-MM-dd'),
    };
  }, [period]);

  // Fetch financial data
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: financialSummary, isLoading: summaryLoading } = useFinancialSummary(startDate, endDate);
  const { data: allBookings = [] } = useBookings();

  const isLoading = transactionsLoading || summaryLoading;

  // Calculate summary metrics
  const totalRevenue = financialSummary?.totalIncome || 0;
  const totalExpenses = financialSummary?.totalExpenses || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Build revenue breakdown from income categories
  const revenueBreakdown = useMemo(() => {
    if (!financialSummary) return [];

    return Object.entries(financialSummary.incomeByCategory || {})
      .map(([category, amount]) => ({
        label: categoryLabels[category] || category,
        amount: Number(amount),
        percentage: totalRevenue > 0 ? (Number(amount) / totalRevenue) * 100 : 0,
        color: categoryColors[category] || 'bg-gray-500',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [financialSummary, totalRevenue]);

  // Build expense breakdown from expense categories
  const expenseBreakdown = useMemo(() => {
    if (!financialSummary) return [];

    return Object.entries(financialSummary.expensesByCategory || {})
      .map(([category, amount]) => ({
        label: categoryLabels[category] || category,
        amount: Number(amount),
        percentage: totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0,
        color: categoryColors[category] || 'bg-gray-500',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [financialSummary, totalExpenses]);

  // Calculate property performance from bookings
  const propertyPerformance = useMemo(() => {
    const periodBookings = allBookings.filter(b => {
      const checkIn = new Date(b.check_in_date);
      return checkIn >= new Date(startDate) && checkIn <= new Date(endDate) && b.status !== 'cancelled';
    });

    const propertyStats: Record<string, any> = {};

    periodBookings.forEach(booking => {
      const propId = booking.property_id;
      if (!propertyStats[propId]) {
        propertyStats[propId] = {
          name: booking.property?.name || 'Unknown',
          bookings: 0,
          revenue: 0,
          totalNights: 0,
        };
      }

      propertyStats[propId].bookings++;
      propertyStats[propId].revenue += booking.total_amount || 0;

      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      propertyStats[propId].totalNights += nights;
    });

    return Object.values(propertyStats)
      .map((stat: any) => ({
        ...stat,
        avgRate: stat.bookings > 0 ? stat.revenue / stat.bookings : 0,
        occupancy: 0, // Calculated below if we have property data
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue);
  }, [allBookings, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
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
                {revenueBreakdown.length > 0 ? (
                  <>
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
                          <span className="text-xs text-muted-foreground w-12 text-right">{item.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="font-medium text-foreground">Total Revenue</span>
                      <span className="font-bold text-accent text-lg">{formatFullCurrency(totalRevenue)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">No revenue data for this period</p>
                  </div>
                )}
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
                {expenseBreakdown.length > 0 ? (
                  <>
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
                          <span className="text-xs text-muted-foreground w-12 text-right">{item.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="font-medium text-foreground">Total Expenses</span>
                      <span className="font-bold text-destructive text-lg">{formatFullCurrency(totalExpenses)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">No expense data for this period</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                )}
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
              {propertyPerformance.length > 0 ? (
                propertyPerformance.map((property) => (
                  <div
                    key={property.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">{property.name}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Bookings: <span className="text-foreground font-medium">{property.bookings}</span></span>
                        <span>Avg Rate: <span className="text-foreground font-medium">{formatFullCurrency(property.avgRate)}</span></span>
                        <span>Nights: <span className="text-foreground font-medium">{property.totalNights}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-display font-bold text-accent">{formatFullCurrency(property.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No property bookings for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Financial;
