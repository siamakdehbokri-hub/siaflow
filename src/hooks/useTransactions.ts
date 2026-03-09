import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { enqueueRequest } from '@/lib/offlineDb';

const TRANSACTIONS_KEY = 'transactions';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function mapRow(t: Record<string, unknown>): Transaction {
  return {
    id: t.id as string,
    amount: Number(t.amount),
    type: t.type as 'income' | 'expense' | 'saving',
    category: t.category as string,
    subcategory: (t.subcategory as string) || undefined,
    description: (t.description as string) || undefined,
    date: t.date as string,
    isRecurring: (t.is_recurring as boolean) || false,
    tags: (t.tags as string[]) || [],
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
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

      const dbRow = {
        user_id: user.id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        subcategory: transaction.subcategory || null,
        description: transaction.description,
        date: transaction.date,
        is_recurring: transaction.isRecurring,
        tags: transaction.tags || [],
      };

      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert(dbRow)
          .select()
          .single();
        if (error) throw error;
        return { tx: mapRow(data), queued: false };
      } catch (err) {
        if (!navigator.onLine || (err instanceof TypeError)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/transactions?select=*`,
            method: 'POST',
            payload: dbRow,
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          // Return optimistic data
          const optimistic: Transaction = {
            ...transaction,
            id: `offline-${Date.now()}`,
          };
          return { tx: optimistic, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ tx, queued }) => {
      queryClient.setQueryData<Transaction[]>(
        [TRANSACTIONS_KEY, user?.id],
        (old = []) => [tx, ...old]
      );
      toast.success(queued ? 'ذخیره آفلاین شد. پس از اتصال همگام‌سازی می‌شود.' : 'تراکنش با موفقیت ثبت شد');
    },
    onError: (error: Error) => {
      console.error('Error adding transaction:', error);
      toast.error('خطا در ثبت تراکنش');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!user) throw new Error('Not authenticated');

      const dbRow = {
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        subcategory: transaction.subcategory || null,
        description: transaction.description,
        date: transaction.date,
        is_recurring: transaction.isRecurring,
        tags: transaction.tags || [],
      };

      try {
        const { error } = await supabase
          .from('transactions')
          .update(dbRow)
          .eq('id', transaction.id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { tx: transaction, queued: false };
      } catch (err) {
        if (!navigator.onLine || (err instanceof TypeError)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/transactions?id=eq.${transaction.id}&user_id=eq.${user.id}`,
            method: 'PATCH',
            payload: dbRow,
            headers,
          });
          return { tx: transaction, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ tx, queued }) => {
      queryClient.setQueryData<Transaction[]>(
        [TRANSACTIONS_KEY, user?.id],
        (old = []) => old.map(t => t.id === tx.id ? tx : t)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'تراکنش با موفقیت ویرایش شد');
    },
    onError: (error: Error) => {
      console.error('Error updating transaction:', error);
      toast.error('خطا در ویرایش تراکنش');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, queued: false };
      } catch (err) {
        if (!navigator.onLine || (err instanceof TypeError)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}&user_id=eq.${user.id}`,
            method: 'DELETE',
            payload: null,
            headers,
          });
          return { id, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ id, queued }) => {
      queryClient.setQueryData<Transaction[]>(
        [TRANSACTIONS_KEY, user?.id],
        (old = []) => old.filter(t => t.id !== id)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'تراکنش با موفقیت حذف شد');
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
