import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const TRANSACTIONS_KEY = 'transactions';

function mapRow(t: Record<string, unknown>): Transaction {
  return {
    id: t.id as string,
    amount: Number(t.amount),
    type: t.type as 'income' | 'expense' | 'saving',
    category: t.category as string,
    subcategory: (t.subcategory as string) || undefined,
    description: (t.description as string) || '',
    date: t.date as string,
    isRecurring: (t.is_recurring as boolean) || false,
    tags: (t.tags as string[]) || [],
  };
}

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: [TRANSACTIONS_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          subcategory: transaction.subcategory || null,
          description: transaction.description,
          date: transaction.date,
          is_recurring: transaction.isRecurring,
          tags: transaction.tags || [],
        })
        .select()
        .single();
      if (error) throw error;
      return mapRow(data);
    },
    onSuccess: (newTx) => {
      queryClient.setQueryData<Transaction[]>(
        [TRANSACTIONS_KEY, user?.id],
        (old = []) => [newTx, ...old]
      );
      toast.success('تراکنش با موفقیت ثبت شد');
    },
    onError: (error: Error) => {
      console.error('Error adding transaction:', error);
      toast.error('خطا در ثبت تراکنش');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          subcategory: transaction.subcategory || null,
          description: transaction.description,
          date: transaction.date,
          is_recurring: transaction.isRecurring,
          tags: transaction.tags || [],
        })
        .eq('id', transaction.id)
        .eq('user_id', user.id);
      if (error) throw error;
      return transaction;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Transaction[]>(
        [TRANSACTIONS_KEY, user?.id],
        (old = []) => old.map(t => t.id === updated.id ? updated : t)
      );
      toast.success('تراکنش با موفقیت ویرایش شد');
    },
    onError: (error: Error) => {
      console.error('Error updating transaction:', error);
      toast.error('خطا در ویرایش تراکنش');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Transaction[]>(
        [TRANSACTIONS_KEY, user?.id],
        (old = []) => old.filter(t => t.id !== id)
      );
      toast.success('تراکنش با موفقیت حذف شد');
    },
    onError: (error: Error) => {
      console.error('Error deleting transaction:', error);
      toast.error('خطا در حذف تراکنش');
    },
  });

  return {
    transactions,
    loading,
    addTransaction: (t: Omit<Transaction, 'id'>) => addMutation.mutateAsync(t),
    updateTransaction: (t: Transaction) => updateMutation.mutateAsync(t),
    deleteTransaction: (id: string) => deleteMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY, user?.id] }),
  };
}
