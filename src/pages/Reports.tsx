import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, TrendingUp, Download, Search, Loader2, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  useRevenueReport,
  useOccupancyReport,
  useBookingSummaryReport,
  useFinancialSummaryReport,
  type ReportDateRange,
} from '@/hooks/useReports';
import { toast } from 'sonner';

const Reports = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);

  // Prepare date range for queries
  const dateRange: ReportDateRange | null = startDate && endDate
    ? { startDate, endDate }
    : null;

  // Fetch reports data
  const { data: revenueReport, isLoading: revenueLoading } = useRevenueReport(dateRange);
  const { data: occupancyReport, isLoading: occupancyLoading } = useOccupancyReport(dateRange);
  const { data: bookingReport, isLoading: bookingLoading } = useBookingSummaryReport(dateRange);
  const { data: financialReport, isLoading: financialLoading } = useFinancialSummaryReport(dateRange);

  const isLoading = revenueLoading || occupancyLoading || bookingLoading || financialLoading;
  const hasData = revenueReport || occupancyReport || bookingReport || financialReport;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    if (!hasData) {
      toast.error('No data to export');
      return;
    }
    let csvContent = 'Brooklyn Hills Apartment - Luxury Meets Comfort - Report\n\n';
    csvContent += `Report Period: ${format(startDate!, 'MMM d, yyyy')} - ${format(endDate!, 'MMM d, yyyy')}\n\n`;
    if (revenueReport) {
      csvContent += 'REVENUE SUMMARY\n';
      csvContent += `Total Revenue,${revenueReport.totalRevenue}\n`;
      csvContent += `Booking Revenue,${revenueReport.bookingRevenue}\n`;
      csvContent += `Bar Revenue,${revenueReport.barRevenue}\n\n`;
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)} 
        collapsed={sidebarCollapsed} 
        onToggle={handleToggleSidebar} 
      />
      <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <main 
        className={cn(
          "pt-20 p-6 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Custom Reports
            </h1>
            <p className="text-muted-foreground">
              Select a custom date range to generate detailed performance reports
            </p>
          </div>

          {/* Date range selector card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Select Date Range</h2>
                <p className="text-sm text-muted-foreground">Choose start and end dates for your report</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Start Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={!hasData}
                className="gap-2"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-2xl border border-border/50 bg-card p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
                <p className="text-muted-foreground">Generating report...</p>
              </div>
            </div>
          )}

          {/* Reports Content */}
          {!isLoading && hasData && (
            <div className="space-y-6">
              {/* Revenue Summary */}
              {revenueReport && (
                <Card className="rounded-2xl border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-accent" />
                      Revenue Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(revenueReport.totalRevenue)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Booking Revenue</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(revenueReport.bookingRevenue)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Bar Revenue</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(revenueReport.barRevenue)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {revenueReport.transactionCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial Summary */}
              {financialReport && (
                <Card className="rounded-2xl border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-accent" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(financialReport.totalIncome)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(financialReport.totalExpenses)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(financialReport.netProfit)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
                        <p className="text-xl font-bold text-purple-600">
                          {financialReport.profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Occupancy & Bookings */}
              {(occupancyReport || bookingReport) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {occupancyReport && (
                    <Card className="rounded-2xl border-border/50">
                      <CardHeader>
                        <CardTitle>Occupancy Report</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                            <span className="font-bold text-accent">{occupancyReport.occupancyRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Occupied</span>
                            <span className="font-semibold">{occupancyReport.occupiedProperties} / {occupancyReport.totalProperties}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Bookings</span>
                            <span className="font-semibold">{occupancyReport.totalBookings}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {bookingReport && (
                    <Card className="rounded-2xl border-border/50">
                      <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Bookings</span>
                            <span className="font-bold">{bookingReport.totalBookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confirmed</span>
                            <span className="font-semibold text-emerald-600">{bookingReport.confirmedBookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg. Value</span>
                            <span className="font-semibold">{formatCurrency(bookingReport.averageBookingValue)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasData && startDate && endDate && (
            <div className="rounded-2xl border border-border/50 bg-card p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
                <p className="text-muted-foreground max-w-md">
                  No transactions or bookings found for the selected date range.
                </p>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!startDate || !endDate && (
            <div className="rounded-2xl border border-border/50 bg-card p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select Date Range</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a start and end date above to generate your performance report
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
