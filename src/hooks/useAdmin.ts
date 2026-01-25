import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  roles: string[];
  transactionCount: number;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalCategories: number;
  totalDebts: number;
  totalGoals: number;
  totalAccounts: number;
  totalTransfers: number;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  userName: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description?: string;
  date: string;
  created_at: string;
  is_recurring?: boolean;
  tags?: string[];
}

export interface AdminCategory {
  id: string;
  user_id: string;
  userName: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  budget?: number;
  budget_type?: string;
  subcategories?: string[];
  created_at: string;
}

export interface AdminDebt {
  id: string;
  user_id: string;
  userName: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  creditor: string;
  reason?: string;
  due_date?: string;
  created_at: string;
}

export interface AdminGoal {
  id: string;
  user_id: string;
  userName: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
  icon: string;
  deadline?: string;
  created_at: string;
}

export interface AdminAccount {
  id: string;
  user_id: string;
  userName: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalDebtAmount: number;
  totalDebtPaid: number;
  totalDebtRemaining: number;
  totalGoalTarget: number;
  totalGoalCurrent: number;
  totalGoalProgress: number;
  totalAccountBalance: number;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Extended data states
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [debts, setDebts] = useState<AdminDebt[]>([]);
  const [debtsLoading, setDebtsLoading] = useState(false);
  const [goals, setGoals] = useState<AdminGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [financialSummaryLoading, setFinancialSummaryLoading] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err) {
        console.error('Failed to check admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const callAdminFunction = async (action: string, userId?: string, data?: any) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await supabase.functions.invoke('admin-operations', {
      body: { action, userId, data }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Admin operation failed');
    }

    return response.data;
  };

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    
    setUsersLoading(true);
    try {
      const result = await callAdminFunction('get-users');
      setUsers(result.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast.error('خطا در دریافت لیست کاربران');
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    
    setStatsLoading(true);
    try {
      const result = await callAdminFunction('get-stats');
      setStats(result.stats || null);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      toast.error('خطا در دریافت آمار سیستم');
    } finally {
      setStatsLoading(false);
    }
  }, [isAdmin]);

  const fetchAllTransactions = useCallback(async (filterUserId?: string) => {
    if (!isAdmin) return;
    
    setTransactionsLoading(true);
    try {
      const result = await callAdminFunction('get-all-transactions', undefined, { 
        limit: 500, 
        offset: 0,
        userId: filterUserId
      });
      setTransactions(result.transactions || []);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      toast.error('خطا در دریافت تراکنش‌ها');
    } finally {
      setTransactionsLoading(false);
    }
  }, [isAdmin]);

  const fetchAllCategories = useCallback(async () => {
    if (!isAdmin) return;
    
    setCategoriesLoading(true);
    try {
      const result = await callAdminFunction('get-all-categories');
      setCategories(result.categories || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      toast.error('خطا در دریافت دسته‌بندی‌ها');
    } finally {
      setCategoriesLoading(false);
    }
  }, [isAdmin]);

  const fetchAllDebts = useCallback(async () => {
    if (!isAdmin) return;
    
    setDebtsLoading(true);
    try {
      const result = await callAdminFunction('get-all-debts');
      setDebts(result.debts || []);
    } catch (err: any) {
      console.error('Error fetching debts:', err);
      toast.error('خطا در دریافت بدهی‌ها');
    } finally {
      setDebtsLoading(false);
    }
  }, [isAdmin]);

  const fetchAllGoals = useCallback(async () => {
    if (!isAdmin) return;
    
    setGoalsLoading(true);
    try {
      const result = await callAdminFunction('get-all-goals');
      setGoals(result.goals || []);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      toast.error('خطا در دریافت اهداف');
    } finally {
      setGoalsLoading(false);
    }
  }, [isAdmin]);

  const fetchAllAccounts = useCallback(async () => {
    if (!isAdmin) return;
    
    setAccountsLoading(true);
    try {
      const result = await callAdminFunction('get-all-accounts');
      setAccounts(result.accounts || []);
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      toast.error('خطا در دریافت حساب‌ها');
    } finally {
      setAccountsLoading(false);
    }
  }, [isAdmin]);

  const fetchFinancialSummary = useCallback(async () => {
    if (!isAdmin) return;
    
    setFinancialSummaryLoading(true);
    try {
      const result = await callAdminFunction('get-financial-summary');
      setFinancialSummary(result.summary || null);
    } catch (err: any) {
      console.error('Error fetching financial summary:', err);
      toast.error('خطا در دریافت خلاصه مالی');
    } finally {
      setFinancialSummaryLoading(false);
    }
  }, [isAdmin]);

  const toggleUserStatus = async (userId: string) => {
    try {
      const result = await callAdminFunction('toggle-user-status', userId);
      toast.success(result.isActive ? 'کاربر فعال شد' : 'کاربر غیرفعال شد');
      await fetchUsers();
      return result;
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      toast.error('خطا در تغییر وضعیت کاربر');
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await callAdminFunction('delete-user', userId);
      toast.success('کاربر با موفقیت حذف شد');
      await fetchUsers();
      await fetchStats();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error('خطا در حذف کاربر');
      throw err;
    }
  };

  const setUserAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      await callAdminFunction('set-admin', userId, { isAdmin: makeAdmin });
      toast.success(makeAdmin ? 'نقش ادمین اضافه شد' : 'نقش ادمین حذف شد');
      await fetchUsers();
    } catch (err: any) {
      console.error('Error setting admin role:', err);
      toast.error('خطا در تغییر نقش کاربر');
      throw err;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      await callAdminFunction('delete-transaction', undefined, { transactionId });
      toast.success('تراکنش حذف شد');
      await fetchAllTransactions();
      await fetchStats();
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      toast.error('خطا در حذف تراکنش');
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await callAdminFunction('delete-category', undefined, { categoryId });
      toast.success('دسته‌بندی حذف شد');
      await fetchAllCategories();
      await fetchStats();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast.error('خطا در حذف دسته‌بندی');
      throw err;
    }
  };

  const deleteDebt = async (debtId: string) => {
    try {
      await callAdminFunction('delete-debt', undefined, { debtId });
      toast.success('بدهی حذف شد');
      await fetchAllDebts();
      await fetchStats();
    } catch (err: any) {
      console.error('Error deleting debt:', err);
      toast.error('خطا در حذف بدهی');
      throw err;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await callAdminFunction('delete-goal', undefined, { goalId });
      toast.success('هدف حذف شد');
      await fetchAllGoals();
      await fetchStats();
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      toast.error('خطا در حذف هدف');
      throw err;
    }
  };

  return {
    isAdmin,
    loading,
    users,
    stats,
    usersLoading,
    statsLoading,
    fetchUsers,
    fetchStats,
    toggleUserStatus,
    deleteUser,
    setUserAdmin,
    // Extended data
    transactions,
    transactionsLoading,
    fetchAllTransactions,
    categories,
    categoriesLoading,
    fetchAllCategories,
    debts,
    debtsLoading,
    fetchAllDebts,
    goals,
    goalsLoading,
    fetchAllGoals,
    accounts,
    accountsLoading,
    fetchAllAccounts,
    financialSummary,
    financialSummaryLoading,
    fetchFinancialSummary,
    // Delete actions
    deleteTransaction,
    deleteCategory,
    deleteDebt,
    deleteGoal
  };
}
