import { shouldQueueOffline } from '@/lib/networkUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { enqueueRequest } from '@/lib/offlineDb';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit' | 'investment';
  balance: number;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  toGoalId: string | null;
  amount: number;
  description: string | null;
  transferType: 'account_to_account' | 'account_to_goal';
  createdAt: string;
}

const ACCOUNTS_KEY = 'accounts';
const TRANSFERS_KEY = 'transfers-list';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function mapAccount(a: Record<string, unknown>): Account {
  return {
    id: a.id as string,
    name: a.name as string,
    type: a.type as Account['type'],
    balance: Number(a.balance),
    color: a.color as string,
    icon: a.icon as string,
    isDefault: a.is_default as boolean,
    createdAt: a.created_at as string,
    updatedAt: a.updated_at as string,
  };
}

function mapTransfer(t: Record<string, unknown>): Transfer {
  return {
    id: t.id as string,
    fromAccountId: t.from_account_id as string | null,
    toAccountId: t.to_account_id as string | null,
    toGoalId: t.to_goal_id as string | null,
    amount: Number(t.amount),
    description: t.description as string | null,
    transferType: t.transfer_type as Transfer['transferType'],
    createdAt: t.created_at as string,
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

export function useAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: loading } = useQuery({
    queryKey: [ACCOUNTS_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapAccount);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const { data: transfers = [] } = useQuery({
    queryKey: [TRANSFERS_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map(mapTransfer);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const addAccountMutation = useMutation({
    mutationFn: async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Not authenticated');
      const dbRow = {
        user_id: user.id,
        name: account.name,
        type: account.type,
        balance: account.balance,
        color: account.color,
        icon: account.icon,
        is_default: account.isDefault,
      };

      try {
        const { data, error } = await supabase
          .from('accounts')
          .insert(dbRow)
          .select()
          .single();
        if (error) throw error;
        return { account: mapAccount(data), queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/accounts?select=*`,
            method: 'POST',
            payload: dbRow,
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          const optimistic: Account = {
            ...account,
            id: `offline-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { account: optimistic, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ account: newAccount, queued }) => {
      queryClient.setQueryData<Account[]>(
        [ACCOUNTS_KEY, user?.id],
        (old = []) => [...old, newAccount]
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'حساب با موفقیت ایجاد شد');
    },
    onError: () => toast.error('خطا در ایجاد حساب'),
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      if (!user) throw new Error('Not authenticated');
      const updateData: Record<string, string | number | boolean | undefined> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.balance !== undefined) updateData.balance = updates.balance;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

      try {
        const { error } = await supabase
          .from('accounts')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, updates, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/accounts?id=eq.${id}&user_id=eq.${user.id}`,
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
      queryClient.setQueryData<Account[]>(
        [ACCOUNTS_KEY, user?.id],
        (old = []) => old.map(a => a.id === id ? { ...a, ...updates } : a)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'حساب با موفقیت بروزرسانی شد');
    },
    onError: () => toast.error('خطا در بروزرسانی حساب'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      try {
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/accounts?id=eq.${id}&user_id=eq.${user.id}`,
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
      queryClient.setQueryData<Account[]>(
        [ACCOUNTS_KEY, user?.id],
        (old = []) => old.filter(a => a.id !== id)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'حساب با موفقیت حذف شد');
    },
    onError: () => toast.error('خطا در حذف حساب'),
  });

  const transferBetweenAccounts = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string
  ) => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('transfer_between_accounts', {
        _user_id: user.id,
        _from_account_id: fromAccountId,
        _to_account_id: toAccountId,
        _amount: amount,
        _description: description || null,
      });
      if (error) throw error;

      queryClient.setQueryData<Account[]>(
        [ACCOUNTS_KEY, user?.id],
        (old = []) => old.map(a => {
          if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
          if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
          return a;
        })
      );
      queryClient.invalidateQueries({ queryKey: [TRANSFERS_KEY, user?.id] });
      toast.success('انتقال با موفقیت انجام شد');
    } catch (err) {
      if (shouldQueueOffline(err)) {
        const headers = await getAuthHeaders();
        await enqueueRequest({
          endpoint: `${SUPABASE_URL}/rest/v1/rpc/transfer_between_accounts`,
          method: 'POST',
          payload: {
            _user_id: user.id,
            _from_account_id: fromAccountId,
            _to_account_id: toAccountId,
            _amount: amount,
            _description: description || null,
          },
          headers,
        });
        queryClient.setQueryData<Account[]>(
          [ACCOUNTS_KEY, user?.id],
          (old = []) => old.map(a => {
            if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
            if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
            return a;
          })
        );
        toast.success('ذخیره آفلاین شد.');
        return;
      }
      const errorMsg = err instanceof Error ? err.message : '';
      toast.error(errorMsg.includes('Insufficient balance') ? 'موجودی حساب مبدا کافی نیست' : 'خطا در انتقال');
    }
  };

  const transferToGoal = async (
    fromAccountId: string,
    toGoalId: string,
    amount: number,
    description?: string
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.rpc('transfer_to_goal', {
        _user_id: user.id,
        _from_account_id: fromAccountId,
        _to_goal_id: toGoalId,
        _amount: amount,
        _description: description || null,
      });
      if (error) throw error;

      queryClient.setQueryData<Account[]>(
        [ACCOUNTS_KEY, user?.id],
        (old = []) => old.map(a =>
          a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
        )
      );
      queryClient.invalidateQueries({ queryKey: [TRANSFERS_KEY, user?.id] });
      toast.success('انتقال به هدف پس‌انداز انجام شد');
      return true;
    } catch (err) {
      if (shouldQueueOffline(err)) {
        const headers = await getAuthHeaders();
        await enqueueRequest({
          endpoint: `${SUPABASE_URL}/rest/v1/rpc/transfer_to_goal`,
          method: 'POST',
          payload: {
            _user_id: user.id,
            _from_account_id: fromAccountId,
            _to_goal_id: toGoalId,
            _amount: amount,
            _description: description || null,
          },
          headers,
        });
        queryClient.setQueryData<Account[]>(
          [ACCOUNTS_KEY, user?.id],
          (old = []) => old.map(a =>
            a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
          )
        );
        toast.success('ذخیره آفلاین شد.');
        return true;
      }
      const errorMsg = err instanceof Error ? err.message : '';
      toast.error(errorMsg.includes('Insufficient balance') ? 'موجودی حساب مبدا کافی نیست' : 'خطا در انتقال');
      return false;
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    accounts,
    transfers,
    loading,
    addAccount: (a: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => addAccountMutation.mutateAsync(a),
    updateAccount: (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) =>
      updateAccountMutation.mutateAsync({ id, updates }),
    deleteAccount: (id: string) => deleteAccountMutation.mutateAsync(id),
    transferBetweenAccounts,
    transferToGoal,
    totalBalance,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_KEY, user?.id] });
      queryClient.invalidateQueries({ queryKey: [TRANSFERS_KEY, user?.id] });
    },
  };
}
