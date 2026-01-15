import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';

interface MonthlyStats {
  totalBookings: number;
  accommodationRevenue: number;
  barRevenue: number;
  totalRevenue: number;
  bookingsChange: string;
  accommodationChange: string;
  barChange: string;
  totalChange: string;
  weeklyRevenueData: number[]; // 7 values for Mon-Sun
  currentMonthLabel: string;
}

export const useMonthlyOverview = () => {
  return useQuery({
    queryKey: ['monthly-overview'],
    queryFn: async (): Promise<MonthlyStats> => {
      const now = new Date();
      const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const currentMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
      
      // Get current week for the chart
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const [
        currentBookingsResult,
        lastMonthBookingsResult,
        currentAccommodationResult,
        lastMonthAccommodationResult,
        currentBarResult,
        lastMonthBarResult,
        weeklyTransactionsResult,
      ] = await Promise.all([
        // Current month bookings
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .gte('check_in_date', currentMonthStart)
          .lte('check_in_date', currentMonthEnd)
          .not('status', 'eq', 'cancelled'),

        // Last month bookings
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .gte('check_in_date', lastMonthStart)
          .lte('check_in_date', lastMonthEnd)
          .not('status', 'eq', 'cancelled'),

        // Current month accommodation revenue (booking_payment category)
        supabase
          .from('transactions')
          .select('amount')
          .eq('transaction_type', 'income')
          .eq('category', 'booking_payment')
          .gte('created_at', `${currentMonthStart}T00:00:00`)
          .lte('created_at', `${currentMonthEnd}T23:59:59`),

        // Last month accommodation revenue
        supabase
          .from('transactions')
          .select('amount')
          .eq('transaction_type', 'income')
          .eq('category', 'booking_payment')
          .gte('created_at', `${lastMonthStart}T00:00:00`)
          .lte('created_at', `${lastMonthEnd}T23:59:59`),

        // Current month bar revenue
        supabase
          .from('transactions')
          .select('amount')
          .eq('transaction_type', 'income')
          .eq('category', 'bar_sales')
          .gte('created_at', `${currentMonthStart}T00:00:00`)
          .lte('created_at', `${currentMonthEnd}T23:59:59`),

        // Last month bar revenue
        supabase
          .from('transactions')
          .select('amount')
          .eq('transaction_type', 'income')
          .eq('category', 'bar_sales')
          .gte('created_at', `${lastMonthStart}T00:00:00`)
          .lte('created_at', `${lastMonthEnd}T23:59:59`),

        // This week's daily transactions for chart
        supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('transaction_type', 'income')
          .gte('created_at', `${format(weekStart, 'yyyy-MM-dd')}T00:00:00`)
          .lte('created_at', `${format(weekEnd, 'yyyy-MM-dd')}T23:59:59`),
      ]);

      // Calculate current month values
      const totalBookings = currentBookingsResult.count || 0;
      const lastMonthBookings = lastMonthBookingsResult.count || 0;
      
      const accommodationRevenue = currentAccommodationResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const lastMonthAccommodation = lastMonthAccommodationResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      const barRevenue = currentBarResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const lastMonthBar = lastMonthBarResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      const totalRevenue = accommodationRevenue + barRevenue;
      const lastMonthTotal = lastMonthAccommodation + lastMonthBar;

      // Calculate changes
      const calculateChange = (current: number, previous: number): string => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${Math.round(change)}%`;
      };

      const calculateBookingsChange = (current: number, previous: number): string => {
        const diff = current - previous;
        const sign = diff >= 0 ? '+' : '';
        return `${sign}${diff}`;
      };

      // Process weekly data for chart (Mon-Sun)
      const weeklyRevenueData = weekDays.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayRevenue = weeklyTransactionsResult.data?.filter(t => {
          const transactionDate = format(new Date(t.created_at), 'yyyy-MM-dd');
          return transactionDate === dayStr;
        }).reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        return dayRevenue;
      });

      // Normalize for chart display (as percentages of max)
      const maxRevenue = Math.max(...weeklyRevenueData, 1);
      const normalizedWeeklyData = weeklyRevenueData.map(val => Math.round((val / maxRevenue) * 100));

      const currentMonthLabel = format(now, 'MMMM yyyy');

      return {
        totalBookings,
        accommodationRevenue,
        barRevenue,
        totalRevenue,
        bookingsChange: calculateBookingsChange(totalBookings, lastMonthBookings),
        accommodationChange: calculateChange(accommodationRevenue, lastMonthAccommodation),
        barChange: calculateChange(barRevenue, lastMonthBar),
        totalChange: calculateChange(totalRevenue, lastMonthTotal),
        weeklyRevenueData: normalizedWeeklyData,
        currentMonthLabel,
      };
    },
    refetchInterval: 60000,
  });
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(0)}K`;
  }
  return `₦${amount.toFixed(0)}`;
};
