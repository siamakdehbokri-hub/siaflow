import { shouldQueueOffline } from '@/lib/networkUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { enqueueRequest } from '@/lib/offlineDb';

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  creditor: string;
  reason?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const DEBTS_KEY = 'debts';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function mapDebt(d: Record<string, unknown>): Debt {
  return {
    id: d.id as string,
    name: d.name as string,
    totalAmount: Number(d.total_amount),
    paidAmount: Number(d.paid_amount),
    creditor: d.creditor as string,
    reason: (d.reason as string) || undefined,
    dueDate: (d.due_date as string) || undefined,
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
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

export function useDebts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading: loading } = useQuery({
    queryKey: [DEBTS_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDebt);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: async (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Not authenticated');
      const dbRow = {
        user_id: user.id,
        name: debt.name,
        total_amount: debt.totalAmount,
        paid_amount: debt.paidAmount,
        creditor: debt.creditor,
        reason: debt.reason || null,
        due_date: debt.dueDate || null,
      };

      try {
        const { data, error } = await supabase
          .from('debts')
          .insert(dbRow)
          .select()
          .single();
        if (error) throw error;
        return { debt: mapDebt(data), queued: false };
      } catch (err) {
        if (!navigator.onLine || (err instanceof TypeError)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/debts?select=*`,
            method: 'POST',
            payload: dbRow,
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          const optimistic: Debt = {
            ...debt,
            id: `offline-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { debt: optimistic, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ debt: newDebt, queued }) => {
      queryClient.setQueryData<Debt[]>(
        [DEBTS_KEY, user?.id],
        (old = []) => [newDebt, ...old]
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'بدهی با موفقیت ثبت شد');
    },
    onError: () => toast.error('خطا در ثبت بدهی'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      if (!user) throw new Error('Not authenticated');
      const updateData: Record<string, string | number | null | undefined> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
      if (updates.paidAmount !== undefined) updateData.paid_amount = updates.paidAmount;
      if (updates.creditor !== undefined) updateData.creditor = updates.creditor;
      if (updates.reason !== undefined) updateData.reason = updates.reason || null;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate || null;

      try {
        const { error } = await supabase
          .from('debts')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, updates, queued: false };
      } catch (err) {
        if (!navigator.onLine || (err instanceof TypeError)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/debts?id=eq.${id}&user_id=eq.${user.id}`,
            method: 'PATCH',
            payload: updateData,
            headers,
          });
          return { id, updates, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ id, updates, queued }) => {
      queryClient.setQueryData<Debt[]>(
        [DEBTS_KEY, user?.id],
        (old = []) => old.map(d => d.id === id ? { ...d, ...updates } : d)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'بدهی با موفقیت بروزرسانی شد');
    },
    onError: () => toast.error('خطا در بروزرسانی بدهی'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      try {
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, queued: false };
      } catch (err) {
        if (!navigator.onLine || (err instanceof TypeError)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/debts?id=eq.${id}&user_id=eq.${user.id}`,
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
      queryClient.setQueryData<Debt[]>(
        [DEBTS_KEY, user?.id],
        (old = []) => old.filter(d => d.id !== id)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'بدهی با موفقیت حذف شد');
    },
    onError: () => toast.error('خطا در حذف بدهی'),
  });

  const addPayment = async (id: string, amount: number) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const newPaidAmount = Math.min(debt.paidAmount + amount, debt.totalAmount);
    await updateMutation.mutateAsync({ id, updates: { paidAmount: newPaidAmount } });
    if (newPaidAmount >= debt.totalAmount) {
      toast.success('تبریک! بدهی به طور کامل پرداخت شد!');
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalRemaining = totalDebt - totalPaid;

  return {
    debts,
    loading,
    addDebt: (d: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => addMutation.mutateAsync(d),
    updateDebt: (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteDebt: (id: string) => deleteMutation.mutateAsync(id),
    addPayment,
    refetch: () => queryClient.invalidateQueries({ queryKey: [DEBTS_KEY, user?.id] }),
    stats: {
      totalDebt,
      totalPaid,
      totalRemaining,
      progress: totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0,
    },
  };
}
