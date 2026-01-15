import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

export interface RevenueReport {
  totalRevenue: number;
  bookingRevenue: number;
  barRevenue: number;
  otherRevenue: number;
  transactionCount: number;
  dailyRevenue: Array<{
    date: string;
    amount: number;
  }>;
}

export interface OccupancyReport {
  totalProperties: number;
  availableProperties: number;
  occupiedProperties: number;
  maintenanceProperties: number;
  occupancyRate: number;
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
}

export interface BookingSummary {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  averageBookingValue: number;
  topProperties: Array<{
    property_name: string;
    booking_count: number;
    revenue: number;
  }>;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  incomeByCategory: Array<{
    category: string;
    amount: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

// Revenue Report
export const useRevenueReport = (dateRange: ReportDateRange | null) => {
  return useQuery({
    queryKey: ['reports', 'revenue', dateRange],
    queryFn: async () => {
      if (!dateRange) return null;

      // Fetch all transactions in date range
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_type', 'income')
        .gte('transaction_date', dateRange.startDate.toISOString())
        .lte('transaction_date', dateRange.endDate.toISOString());

      if (error) {
        console.error('Error fetching revenue report:', error);
        throw error;
      }

      const bookingRevenue = transactions
        .filter(t => t.category === 'booking_payment')
        .reduce((sum, t) => sum + t.amount, 0);

      const barRevenue = transactions
        .filter(t => t.category === 'bar_sales')
        .reduce((sum, t) => sum + t.amount, 0);

      const otherRevenue = transactions
        .filter(t => t.category !== 'booking_payment' && t.category !== 'bar_sales')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalRevenue = bookingRevenue + barRevenue + otherRevenue;

      // Calculate daily revenue
      const dailyRevenueMap = new Map<string, number>();
      transactions.forEach(t => {
        const date = new Date(t.transaction_date).toISOString().split('T')[0];
        dailyRevenueMap.set(date, (dailyRevenueMap.get(date) || 0) + t.amount);
      });

      const dailyRevenue = Array.from(dailyRevenueMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalRevenue,
        bookingRevenue,
        barRevenue,
        otherRevenue,
        transactionCount: transactions.length,
        dailyRevenue,
      } as RevenueReport;
    },
    enabled: !!dateRange,
  });
};

// Occupancy Report
export const useOccupancyReport = (dateRange: ReportDateRange | null) => {
  return useQuery({
    queryKey: ['reports', 'occupancy', dateRange],
    queryFn: async () => {
      if (!dateRange) return null;

      // Fetch properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*');

      if (propError) throw propError;

      const totalProperties = properties.length;
      const availableProperties = properties.filter(p => p.status === 'available').length;
      const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
      const maintenanceProperties = properties.filter(p => p.status === 'maintenance').length;

      // Fetch bookings in date range
      const { data: bookings, error: bookError } = await supabase
        .from('bookings')
        .select('*')
        .or(`check_in_date.gte.${dateRange.startDate.toISOString()},check_out_date.lte.${dateRange.endDate.toISOString()}`);

      if (bookError) throw bookError;

      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b =>
        b.status === 'confirmed' || b.status === 'checked_in'
      ).length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;

      const occupancyRate = totalProperties > 0
        ? (occupiedProperties / totalProperties) * 100
        : 0;

      return {
        totalProperties,
        availableProperties,
        occupiedProperties,
        maintenanceProperties,
        occupancyRate,
        totalBookings,
        completedBookings,
        activeBookings,
      } as OccupancyReport;
    },
    enabled: !!dateRange,
  });
};

// Booking Summary Report
export const useBookingSummaryReport = (dateRange: ReportDateRange | null) => {
  return useQuery({
    queryKey: ['reports', 'bookings', dateRange],
    queryFn: async () => {
      if (!dateRange) return null;

      // Fetch bookings in date range
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (name)
        `)
        .gte('created_at', dateRange.startDate.toISOString())
        .lte('created_at', dateRange.endDate.toISOString());

      if (error) throw error;

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      const checkedInBookings = bookings.filter(b => b.status === 'checked_in').length;
      const checkedOutBookings = bookings.filter(b => b.status === 'checked_out').length;

      const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Top properties by booking count
      const propertyBookings = new Map<string, { count: number; revenue: number }>();
      bookings.forEach(b => {
        const propertyName = (b.properties as any)?.name || 'Unknown';
        const current = propertyBookings.get(propertyName) || { count: 0, revenue: 0 };
        propertyBookings.set(propertyName, {
          count: current.count + 1,
          revenue: current.revenue + b.total_price,
        });
      });

      const topProperties = Array.from(propertyBookings.entries())
        .map(([property_name, data]) => ({
          property_name,
          booking_count: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.booking_count - a.booking_count)
        .slice(0, 5);

      return {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        checkedInBookings,
        checkedOutBookings,
        averageBookingValue,
        topProperties,
      } as BookingSummary;
    },
    enabled: !!dateRange,
  });
};

// Financial Summary Report
export const useFinancialSummaryReport = (dateRange: ReportDateRange | null) => {
  return useQuery({
    queryKey: ['reports', 'financial', dateRange],
    queryFn: async () => {
      if (!dateRange) return null;

      // Fetch all transactions in date range
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', dateRange.startDate.toISOString())
        .lte('transaction_date', dateRange.endDate.toISOString());

      if (error) throw error;

      const income = transactions.filter(t => t.transaction_type === 'income');
      const expenses = transactions.filter(t => t.transaction_type === 'expense');

      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      // Group income by category
      const incomeByCategoryMap = new Map<string, number>();
      income.forEach(t => {
        incomeByCategoryMap.set(
          t.category,
          (incomeByCategoryMap.get(t.category) || 0) + t.amount
        );
      });

      const incomeByCategory = Array.from(incomeByCategoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Group expenses by category
      const expensesByCategoryMap = new Map<string, number>();
      expenses.forEach(t => {
        expensesByCategoryMap.set(
          t.category,
          (expensesByCategoryMap.get(t.category) || 0) + t.amount
        );
      });

      const expensesByCategory = Array.from(expensesByCategoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        incomeByCategory,
        expensesByCategory,
      } as FinancialSummary;
    },
    enabled: !!dateRange,
  });
};
