import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category } from '@/types/expense';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedData: Transaction[] = (data || []).map(t => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type as 'income' | 'expense',
        category: t.category,
        description: t.description || '',
        date: t.date,
        isRecurring: t.is_recurring || false,
      }));

      setTransactions(mappedData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('خطا در بارگذاری تراکنش‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          is_recurring: transaction.isRecurring,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        amount: Number(data.amount),
        type: data.type as 'income' | 'expense',
        category: data.category,
        description: data.description || '',
        date: data.date,
        isRecurring: data.is_recurring || false,
      };

      setTransactions([newTransaction, ...transactions]);
      toast.success('تراکنش با موفقیت ثبت شد');
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error('خطا در ثبت تراکنش');
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          is_recurring: transaction.isRecurring,
        })
        .eq('id', transaction.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(transactions.map(t => 
        t.id === transaction.id ? transaction : t
      ));
      toast.success('تراکنش با موفقیت ویرایش شد');
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error('خطا در ویرایش تراکنش');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
      toast.success('تراکنش با موفقیت حذف شد');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('خطا در حذف تراکنش');
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedData: Category[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        budget: c.budget ? Number(c.budget) : undefined,
        spent: 0, // Will be calculated from transactions
        type: c.budget ? 'expense' : 'income',
      }));

      setCategories(mappedData);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('خطا در بارگذاری دسته‌بندی‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        budget: data.budget ? Number(data.budget) : undefined,
        spent: 0,
        type: data.budget ? 'expense' : 'income',
      };

      setCategories([...categories, newCategory]);
      toast.success('دسته‌بندی با موفقیت اضافه شد');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error('خطا در افزودن دسته‌بندی');
    }
  };

  const updateCategory = async (category: Category) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          icon: category.icon,
          color: category.color,
          budget: category.budget || null,
        })
        .eq('id', category.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(categories.map(c => 
        c.id === category.id ? category : c
      ));
      toast.success('دسته‌بندی با موفقیت ویرایش شد');
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error('خطا در ویرایش دسته‌بندی');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      toast.success('دسته‌بندی با موفقیت حذف شد');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error('خطا در حذف دسته‌بندی');
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
