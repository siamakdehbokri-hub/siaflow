import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'card';
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

export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedData: Account[] = (data || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type as Account['type'],
        balance: Number(a.balance),
        color: a.color,
        icon: a.icon,
        isDefault: a.is_default,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

      setAccounts(mappedData);
    } catch (error: unknown) {
      console.error('Error fetching accounts:', error);
      toast.error('خطا در بارگذاری حساب‌ها');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async () => {
    if (!user) {
      setTransfers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedData: Transfer[] = (data || []).map(t => ({
        id: t.id,
        fromAccountId: t.from_account_id,
        toAccountId: t.to_account_id,
        toGoalId: t.to_goal_id,
        amount: Number(t.amount),
        description: t.description,
        transferType: t.transfer_type as Transfer['transferType'],
        createdAt: t.created_at,
      }));

      setTransfers(mappedData);
    } catch (error: unknown) {
      console.error('Error fetching transfers:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransfers();
  }, [user]);

  const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          color: account.color,
          icon: account.icon,
          is_default: account.isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      const newAccount: Account = {
        id: data.id,
        name: data.name,
        type: data.type as Account['type'],
        balance: Number(data.balance),
        color: data.color,
        icon: data.icon,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setAccounts(prev => [...prev, newAccount]);
      toast.success('حساب با موفقیت ایجاد شد');
      return newAccount;
    } catch (error: unknown) {
      console.error('Error adding account:', error);
      toast.error('خطا در ایجاد حساب');
    }
  };

  const updateAccount = async (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) return;

    try {
      const updateData: Record<string, string | number | boolean | undefined> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.balance !== undefined) updateData.balance = updates.balance;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

      const { error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAccounts(prev => prev.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ));
      toast.success('حساب با موفقیت بروزرسانی شد');
    } catch (error: unknown) {
      console.error('Error updating account:', error);
      toast.error('خطا در بروزرسانی حساب');
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success('حساب با موفقیت حذف شد');
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      toast.error('خطا در حذف حساب');
    }
  };

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

      setAccounts(prev => prev.map(a => {
        if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
        if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
        return a;
      }));

      await fetchTransfers();
      toast.success('انتقال با موفقیت انجام شد');
    } catch (error: unknown) {
      console.error('Error transferring:', error);
      const errorMsg = error instanceof Error ? error.message : '';
      const msg = errorMsg.includes('Insufficient balance')
        ? 'موجودی حساب مبدا کافی نیست'
        : 'خطا در انتقال';
      toast.error(msg);
    }
  };

  const transferToGoal = async (
    fromAccountId: string,
    toGoalId: string,
    amount: number,
    description?: string
  ) => {
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

      setAccounts(prev => prev.map(a => 
        a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
      ));

      await fetchTransfers();
      toast.success('انتقال به هدف پس‌انداز انجام شد');
      return true;
    } catch (error: unknown) {
      console.error('Error transferring to goal:', error);
      const errorMsg = error instanceof Error ? error.message : '';
      const msg = errorMsg.includes('Insufficient balance')
        ? 'موجودی حساب مبدا کافی نیست'
        : 'خطا در انتقال';
      toast.error(msg);
      return false;
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    accounts,
    transfers,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    transferBetweenAccounts,
    transferToGoal,
    totalBalance,
    refetch: fetchAccounts,
  };
}
