import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'accommodation'
  | 'bar_sales'
  | 'other_services'
  | 'deposit'
  | 'additional_charges'
  | 'staff_salaries'
  | 'housekeeping'
  | 'utilities'
  | 'maintenance'
  | 'supplies'
  | 'inventory'
  | 'marketing'
  | 'insurance'
  | 'taxes'
  | 'other_expenses';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'paystack' | 'pos' | 'other';

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  category: TransactionCategory;
  amount: number;
  payment_method: PaymentMethod | null;
  booking_id: string | null;
  property_id: string | null;
  description: string | null;
  notes: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  booking?: any;
  property?: any;
}

export interface NewTransaction {
  transaction_type: TransactionType;
  category: TransactionCategory;
  amount: number;
  payment_method?: PaymentMethod;
  booking_id?: string;
  property_id?: string;
  description?: string;
  notes?: string;
  transaction_date?: string;
}

/**
 * Fetch all transactions
 */
export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          booking:bookings(id, booking_number, customer:customers(full_name)),
          property:properties(id, name)
        `)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data as Transaction[];
    },
  });
};

/**
 * Fetch transactions for a specific date range
 */
export const useTransactionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['transactions', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          booking:bookings(id, booking_number, customer:customers(full_name)),
          property:properties(id, name)
        `)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data as Transaction[];
    },
  });
};

/**
 * Create a new transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTransaction: NewTransaction) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction Created',
        description: 'Transaction has been recorded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update a transaction
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction Updated',
        description: 'Transaction has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Delete a transaction
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        throw new Error(`Failed to delete transaction: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction Deleted',
        description: 'Transaction has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Get financial summary for a date range
 */
export const useFinancialSummary = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['financial-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_type, category, amount')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) {
        console.error('Error fetching financial summary:', error);
        throw new Error(`Failed to fetch financial summary: ${error.message}`);
      }

      // Calculate totals
      const totalIncome = data
        .filter((t: any) => t.transaction_type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const totalExpenses = data
        .filter((t: any) => t.transaction_type === 'expense')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      // Group by category
      const incomeByCategory = data
        .filter((t: any) => t.transaction_type === 'income')
        .reduce((acc: any, t: any) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {});

      const expensesByCategory = data
        .filter((t: any) => t.transaction_type === 'expense')
        .reduce((acc: any, t: any) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {});

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        incomeByCategory,
        expensesByCategory,
      };
    },
  });
};
