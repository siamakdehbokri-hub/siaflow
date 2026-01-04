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
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

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
    setUserAdmin
  };
}
