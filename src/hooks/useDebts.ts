import { shouldQueueOffline, isOfflineId } from '@/lib/networkUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { enqueueRequest } from '@/lib/offlineDb';

export type DebtFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  creditor: string;
  reason?: string;
  dueDate?: string;
  /** Number of planned installments (long-term debts). */
  installmentCount?: number;
  /** Amount of each planned installment. */
  installmentAmount?: number;
  /** Payment cadence for installments. */
  frequency: DebtFrequency;
  startDate?: string;
  /** Due date of the next installment. */
  nextDueDate?: string;
  /** Yearly interest / profit rate in percent. */
  interestRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paidAt: string;
  note?: string;
  createdAt: string;
}

const DEBTS_KEY = 'debts';
const DEBT_PAYMENTS_KEY = 'debt-payments';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const EMPTY_DEBTS: Debt[] = [];
const EMPTY_PAYMENTS: DebtPayment[] = [];

function mapDebt(d: Record<string, unknown>): Debt {
  return {
    id: d.id as string,
    name: d.name as string,
    totalAmount: Number(d.total_amount),
    paidAmount: Number(d.paid_amount),
    creditor: d.creditor as string,
    reason: (d.reason as string) || undefined,
    dueDate: (d.due_date as string) || undefined,
    installmentCount: d.installment_count != null ? Number(d.installment_count) : undefined,
    installmentAmount: d.installment_amount != null ? Number(d.installment_amount) : undefined,
    frequency: ((d.frequency as DebtFrequency) || 'monthly'),
    startDate: (d.start_date as string) || undefined,
    nextDueDate: (d.next_due_date as string) || undefined,
    interestRate: d.interest_rate != null ? Number(d.interest_rate) : 0,
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function mapPayment(p: Record<string, unknown>): DebtPayment {
  return {
    id: p.id as string,
    debtId: p.debt_id as string,
    amount: Number(p.amount),
    paidAt: p.paid_at as string,
    note: (p.note as string) || undefined,
    createdAt: p.created_at as string,
  };
}

type DebtInput = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'frequency' | 'interestRate'> & {
  frequency?: DebtFrequency;
  interestRate?: number;
};

function toDbRow(debt: Partial<DebtInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (debt.name !== undefined) row.name = debt.name;
  if (debt.totalAmount !== undefined) row.total_amount = debt.totalAmount;
  if (debt.paidAmount !== undefined) row.paid_amount = debt.paidAmount;
  if (debt.creditor !== undefined) row.creditor = debt.creditor;
  if (debt.reason !== undefined) row.reason = debt.reason || null;
  if (debt.dueDate !== undefined) row.due_date = debt.dueDate || null;
  if (debt.installmentCount !== undefined) row.installment_count = debt.installmentCount || null;
  if (debt.installmentAmount !== undefined) row.installment_amount = debt.installmentAmount || null;
  if (debt.frequency !== undefined) row.frequency = debt.frequency || 'monthly';
  if (debt.startDate !== undefined) row.start_date = debt.startDate || null;
  if (debt.nextDueDate !== undefined) row.next_due_date = debt.nextDueDate || null;
  if (debt.interestRate !== undefined) row.interest_rate = debt.interestRate ?? 0;
  return row;
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

  const { data: debts = EMPTY_DEBTS, isLoading: loading } = useQuery({
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

  const { data: payments = EMPTY_PAYMENTS } = useQuery({
    queryKey: [DEBT_PAYMENTS_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapPayment);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: async (debt: DebtInput) => {
      if (!user) throw new Error('Not authenticated');
      const dbRow = { user_id: user.id, ...toDbRow(debt) };

      try {
        const { data, error } = await supabase
          .from('debts')
          .insert(dbRow as never)
          .select()
          .single();
        if (error) throw error;
        return { debt: mapDebt(data), queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/debts?select=*`,
            method: 'POST',
            payload: dbRow,
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          const optimistic: Debt = {
            frequency: 'monthly',
            interestRate: 0,
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DebtInput> }) => {
      if (!user) throw new Error('Not authenticated');
      if (isOfflineId(id)) {
        toast.warning('این آیتم هنوز همگام‌سازی نشده. لطفاً پس از اتصال دوباره تلاش کنید.');
        throw new Error('OFFLINE_PENDING');
      }
      const updateData = toDbRow(updates);

      try {
        const { error } = await supabase
          .from('debts')
          .update(updateData as never)
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, updates, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
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
      if (isOfflineId(id)) {
        toast.warning('این آیتم هنوز همگام‌سازی نشده. لطفاً پس از اتصال دوباره تلاش کنید.');
        throw new Error('OFFLINE_PENDING');
      }
      try {
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
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
      queryClient.setQueryData<DebtPayment[]>(
        [DEBT_PAYMENTS_KEY, user?.id],
        (old = []) => old.filter(p => p.debtId !== id)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'بدهی با موفقیت حذف شد');
    },
    onError: () => toast.error('خطا در حذف بدهی'),
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount, paidAt, note }: { id: string; amount: number; paidAt?: string; note?: string }) => {
      if (!user) throw new Error('Not authenticated');
      if (isOfflineId(id)) {
        toast.warning('این بدهی هنوز همگام‌سازی نشده. لطفاً پس از اتصال دوباره تلاش کنید.');
        throw new Error('OFFLINE_PENDING');
      }
      const { data, error } = await supabase.rpc('pay_debt_installment', {
        _debt_id: id,
        _amount: amount,
        _paid_at: paidAt || undefined,
        _note: note || undefined,
      });
      if (error) throw error;
      return data as { paid_amount: number; next_due_date: string | null };
    },
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: [DEBTS_KEY, user?.id] });
      queryClient.invalidateQueries({ queryKey: [DEBT_PAYMENTS_KEY, user?.id] });
      const debt = debts.find(d => d.id === id);
      if (debt && result?.paid_amount >= debt.totalAmount) {
        toast.success('تبریک! این بدهی به‌طور کامل تسویه شد');
      } else {
        toast.success('پرداخت ثبت شد');
      }
    },
    onError: (err) => {
      if ((err as Error).message !== 'OFFLINE_PENDING') toast.error('خطا در ثبت پرداخت');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, debtId, amount }: { paymentId: string; debtId: string; amount: number }) => {
      if (!user) throw new Error('Not authenticated');
      const debt = debts.find(d => d.id === debtId);
      const { error } = await supabase
        .from('debt_payments')
        .delete()
        .eq('id', paymentId)
        .eq('user_id', user.id);
      if (error) throw error;
      if (debt) {
        const { error: upErr } = await supabase
          .from('debts')
          .update({ paid_amount: Math.max(0, debt.paidAmount - amount) } as never)
          .eq('id', debtId)
          .eq('user_id', user.id);
        if (upErr) throw upErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEBTS_KEY, user?.id] });
      queryClient.invalidateQueries({ queryKey: [DEBT_PAYMENTS_KEY, user?.id] });
      toast.success('پرداخت حذف شد');
    },
    onError: () => toast.error('خطا در حذف پرداخت'),
  });

  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalRemaining = totalDebt - totalPaid;
  const monthlyCommitment = debts.reduce((sum, d) => {
    if (d.paidAmount >= d.totalAmount) return sum;
    if (!d.installmentAmount) return sum;
    const perMonth = d.frequency === 'weekly'
      ? d.installmentAmount * 4
      : d.frequency === 'biweekly'
        ? d.installmentAmount * 2
        : d.frequency === 'quarterly'
          ? d.installmentAmount / 3
          : d.frequency === 'yearly'
            ? d.installmentAmount / 12
            : d.installmentAmount;
    return sum + perMonth;
  }, 0);

  return {
    debts,
    payments,
    loading,
    addDebt: (d: DebtInput) => addMutation.mutateAsync(d),
    updateDebt: (id: string, updates: Partial<DebtInput>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteDebt: (id: string) => deleteMutation.mutateAsync(id),
    addPayment: (id: string, amount: number, paidAt?: string, note?: string) =>
      paymentMutation.mutateAsync({ id, amount, paidAt, note }),
    deletePayment: (paymentId: string, debtId: string, amount: number) =>
      deletePaymentMutation.mutateAsync({ paymentId, debtId, amount }),
    paymentPending: paymentMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: [DEBTS_KEY, user?.id] });
      queryClient.invalidateQueries({ queryKey: [DEBT_PAYMENTS_KEY, user?.id] });
    },
    stats: {
      totalDebt,
      totalPaid,
      totalRemaining,
      progress: totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0,
      monthlyCommitment,
      activeCount: debts.filter(d => d.paidAmount < d.totalAmount).length,
      settledCount: debts.filter(d => d.paidAmount >= d.totalAmount).length,
    },
  };
}
