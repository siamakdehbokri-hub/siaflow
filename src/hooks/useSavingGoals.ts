import { shouldQueueOffline, isOfflineId } from '@/lib/networkUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { enqueueRequest } from '@/lib/offlineDb';

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalTransaction {
  id: string;
  goalId: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  note?: string;
  createdAt: string;
}

const GOALS_KEY = 'saving-goals';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function mapGoal(g: Record<string, unknown>): SavingGoal {
  return {
    id: g.id as string,
    name: g.name as string,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    color: g.color as string,
    icon: g.icon as string,
    deadline: (g.deadline as string) || undefined,
    createdAt: g.created_at as string,
    updatedAt: g.updated_at as string,
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

export function useSavingGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading: loading } = useQuery({
    queryKey: [GOALS_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapGoal);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: async (goal: Omit<SavingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => {
      if (!user) throw new Error('Not authenticated');
      const dbRow = {
        user_id: user.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: 0,
        color: goal.color,
        icon: goal.icon,
        deadline: goal.deadline || null,
      };

      try {
        const { data, error } = await supabase
          .from('saving_goals')
          .insert(dbRow)
          .select()
          .single();
        if (error) throw error;
        return { goal: mapGoal(data), queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/saving_goals?select=*`,
            method: 'POST',
            payload: dbRow,
            headers: { ...headers, 'Prefer': 'return=representation' },
          });
          const optimistic: SavingGoal = {
            ...goal,
            id: `offline-${Date.now()}`,
            currentAmount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { goal: optimistic, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ goal: newGoal, queued }) => {
      queryClient.setQueryData<SavingGoal[]>(
        [GOALS_KEY, user?.id],
        (old = []) => [newGoal, ...old]
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'هدف پس‌انداز با موفقیت ایجاد شد');
    },
    onError: () => toast.error('خطا در ایجاد هدف'),
  });

  const updateAmountMutation = useMutation({
    mutationFn: async ({ goalId, amount, type, note }: { goalId: string; amount: number; type: 'deposit' | 'withdraw'; note?: string }) => {
      if (!user) throw new Error('Not authenticated');
      if (isOfflineId(goalId)) {
        toast.warning('این آیتم هنوز همگام‌سازی نشده. لطفاً پس از اتصال دوباره تلاش کنید.');
        throw new Error('OFFLINE_PENDING');
      }

      try {
        const { data, error } = await supabase.rpc('update_goal_amount', {
          _user_id: user.id,
          _goal_id: goalId,
          _amount: amount,
          _type: type,
          _note: note || null,
        });
        if (error) throw error;
        const result = data as { new_amount?: number } | null;
        const goal = goals.find(g => g.id === goalId);
        const newAmount = result?.new_amount ?? (type === 'deposit'
          ? (goal?.currentAmount || 0) + amount
          : Math.max(0, (goal?.currentAmount || 0) - amount));
        return { goalId, newAmount: Number(newAmount), type, targetAmount: goal?.targetAmount || 0, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/rpc/update_goal_amount`,
            method: 'POST',
            payload: {
              _user_id: user.id,
              _goal_id: goalId,
              _amount: amount,
              _type: type,
              _note: note || null,
            },
            headers,
          });
          const goal = goals.find(g => g.id === goalId);
          const newAmount = type === 'deposit'
            ? (goal?.currentAmount || 0) + amount
            : Math.max(0, (goal?.currentAmount || 0) - amount);
          return { goalId, newAmount, type, targetAmount: goal?.targetAmount || 0, queued: true };
        }
        throw err;
      }
    },
    onSuccess: ({ goalId, newAmount, type, targetAmount, queued }) => {
      queryClient.setQueryData<SavingGoal[]>(
        [GOALS_KEY, user?.id],
        (old = []) => old.map(g => g.id === goalId ? { ...g, currentAmount: newAmount } : g)
      );
      if (queued) {
        toast.success('ذخیره آفلاین شد.');
      } else {
        const progress = (newAmount / targetAmount) * 100;
        if (progress >= 100) {
          toast.success('تبریک! به هدف پس‌انداز خود رسیدید!');
        } else if (progress >= 90) {
          toast.success('تبریک! شما به هدفتان نزدیک شدید!');
        } else {
          toast.success(type === 'deposit' ? 'واریز با موفقیت ثبت شد' : 'برداشت با موفقیت ثبت شد');
        }
      }
    },
    onError: () => toast.error('خطا در ثبت تراکنش'),
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
          .from('saving_goals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { id, queued: false };
      } catch (err) {
        if (shouldQueueOffline(err)) {
          const headers = await getAuthHeaders();
          await enqueueRequest({
            endpoint: `${SUPABASE_URL}/rest/v1/saving_goals?id=eq.${id}&user_id=eq.${user.id}`,
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
      queryClient.setQueryData<SavingGoal[]>(
        [GOALS_KEY, user?.id],
        (old = []) => old.filter(g => g.id !== id)
      );
      toast.success(queued ? 'ذخیره آفلاین شد.' : 'هدف پس‌انداز با موفقیت حذف شد');
    },
    onError: () => toast.error('خطا در حذف هدف'),
  });

  return {
    goals,
    loading,
    addGoal: (g: Omit<SavingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => addMutation.mutateAsync(g),
    updateGoalAmount: (goalId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) =>
      updateAmountMutation.mutateAsync({ goalId, amount, type, note }),
    deleteGoal: (id: string) => deleteMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries({ queryKey: [GOALS_KEY, user?.id] }),
  };
}
