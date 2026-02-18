import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

export function useDebts() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDebts = async () => {
    if (!user) {
      setDebts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData: Debt[] = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        totalAmount: Number(d.total_amount),
        paidAmount: Number(d.paid_amount),
        creditor: d.creditor,
        reason: d.reason || undefined,
        dueDate: d.due_date || undefined,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setDebts(mappedData);
    } catch (error: unknown) {
      console.error('Error fetching debts:', error);
      toast.error('خطا در بارگذاری بدهی‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDebts();
    } else {
      setDebts([]);
      setLoading(false);
    }
  }, [user?.id]);

  const addDebt = async (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          user_id: user.id,
          name: debt.name,
          total_amount: debt.totalAmount,
          paid_amount: debt.paidAmount,
          creditor: debt.creditor,
          reason: debt.reason || null,
          due_date: debt.dueDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newDebt: Debt = {
        id: data.id,
        name: data.name,
        totalAmount: Number(data.total_amount),
        paidAmount: Number(data.paid_amount),
        creditor: data.creditor,
        reason: data.reason || undefined,
        dueDate: data.due_date || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setDebts(prev => [newDebt, ...prev]);
      toast.success('بدهی با موفقیت ثبت شد');
    } catch (error: unknown) {
      console.error('Error adding debt:', error);
      toast.error('خطا در ثبت بدهی');
    }
  };

  const updateDebt = async (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) return;

    try {
      const updateData: Record<string, string | number | null | undefined> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount;
      if (updates.paidAmount !== undefined) updateData.paid_amount = updates.paidAmount;
      if (updates.creditor !== undefined) updateData.creditor = updates.creditor;
      if (updates.reason !== undefined) updateData.reason = updates.reason || null;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate || null;

      const { error } = await supabase
        .from('debts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDebts(prev => prev.map(d => 
        d.id === id ? { ...d, ...updates } : d
      ));
      toast.success('بدهی با موفقیت بروزرسانی شد');
    } catch (error: unknown) {
      console.error('Error updating debt:', error);
      toast.error('خطا در بروزرسانی بدهی');
    }
  };

  const deleteDebt = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDebts(prev => prev.filter(d => d.id !== id));
      toast.success('بدهی با موفقیت حذف شد');
    } catch (error: unknown) {
      console.error('Error deleting debt:', error);
      toast.error('خطا در حذف بدهی');
    }
  };

  const addPayment = async (id: string, amount: number) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newPaidAmount = Math.min(debt.paidAmount + amount, debt.totalAmount);
    await updateDebt(id, { paidAmount: newPaidAmount });

    // Check if fully paid
    if (newPaidAmount >= debt.totalAmount) {
      toast.success('🎉 تبریک! بدهی به طور کامل پرداخت شد!');
    }
  };

  // Calculate statistics
  const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalRemaining = totalDebt - totalPaid;

  return {
    debts,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    addPayment,
    refetch: fetchDebts,
    stats: {
      totalDebt,
      totalPaid,
      totalRemaining,
      progress: totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0,
    },
  };
}
