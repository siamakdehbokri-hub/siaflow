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
    } catch (error: any) {
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
    } catch (error: any) {
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

      setAccounts([...accounts, newAccount]);
      toast.success('حساب با موفقیت ایجاد شد');
      return newAccount;
    } catch (error: any) {
      console.error('Error adding account:', error);
      toast.error('خطا در ایجاد حساب');
    }
  };

  const updateAccount = async (id: string, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) return;

    try {
      const updateData: Record<string, any> = {};
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

      setAccounts(accounts.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ));
      toast.success('حساب با موفقیت بروزرسانی شد');
    } catch (error: any) {
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

      setAccounts(accounts.filter(a => a.id !== id));
      toast.success('حساب با موفقیت حذف شد');
    } catch (error: any) {
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

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);

    if (!fromAccount || !toAccount) {
      toast.error('حساب یافت نشد');
      return;
    }

    if (fromAccount.balance < amount) {
      toast.error('موجودی حساب مبدا کافی نیست');
      return;
    }

    try {
      // Update from account
      const { error: error1 } = await supabase
        .from('accounts')
        .update({ balance: fromAccount.balance - amount })
        .eq('id', fromAccountId)
        .eq('user_id', user.id);

      if (error1) throw error1;

      // Update to account
      const { error: error2 } = await supabase
        .from('accounts')
        .update({ balance: toAccount.balance + amount })
        .eq('id', toAccountId)
        .eq('user_id', user.id);

      if (error2) throw error2;

      // Record transfer
      const { error: error3 } = await supabase
        .from('transfers')
        .insert({
          user_id: user.id,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount,
          description: description || null,
          transfer_type: 'account_to_account',
        });

      if (error3) throw error3;

      setAccounts(accounts.map(a => {
        if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
        if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
        return a;
      }));

      await fetchTransfers();
      toast.success('انتقال با موفقیت انجام شد');
    } catch (error: any) {
      console.error('Error transferring:', error);
      toast.error('خطا در انتقال');
    }
  };

  const transferToGoal = async (
    fromAccountId: string,
    toGoalId: string,
    amount: number,
    description?: string
  ) => {
    if (!user) return;

    const fromAccount = accounts.find(a => a.id === fromAccountId);

    if (!fromAccount) {
      toast.error('حساب یافت نشد');
      return;
    }

    if (fromAccount.balance < amount) {
      toast.error('موجودی حساب مبدا کافی نیست');
      return;
    }

    try {
      // Update from account
      const { error: error1 } = await supabase
        .from('accounts')
        .update({ balance: fromAccount.balance - amount })
        .eq('id', fromAccountId)
        .eq('user_id', user.id);

      if (error1) throw error1;

      // Record transfer
      const { error: error2 } = await supabase
        .from('transfers')
        .insert({
          user_id: user.id,
          from_account_id: fromAccountId,
          to_goal_id: toGoalId,
          amount,
          description: description || null,
          transfer_type: 'account_to_goal',
        });

      if (error2) throw error2;

      setAccounts(accounts.map(a => 
        a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
      ));

      await fetchTransfers();
      toast.success('انتقال به هدف پس‌انداز انجام شد');
      return true;
    } catch (error: any) {
      console.error('Error transferring to goal:', error);
      toast.error('خطا در انتقال');
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
