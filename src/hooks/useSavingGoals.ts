import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
      const { data, error } = await supabase
        .from('saving_goals')
        .insert({
          user_id: user.id,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: 0,
          color: goal.color,
          icon: goal.icon,
          deadline: goal.deadline || null,
        })
        .select()
        .single();
      if (error) throw error;
      return mapGoal(data);
    },
    onSuccess: (newGoal) => {
      queryClient.setQueryData<SavingGoal[]>(
        [GOALS_KEY, user?.id],
        (old = []) => [newGoal, ...old]
      );
      toast.success('هدف پس‌انداز با موفقیت ایجاد شد');
    },
    onError: () => toast.error('خطا در ایجاد هدف'),
  });

  const updateAmountMutation = useMutation({
    mutationFn: async ({ goalId, amount, type, note }: { goalId: string; amount: number; type: 'deposit' | 'withdraw'; note?: string }) => {
      if (!user) throw new Error('Not authenticated');
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
      return { goalId, newAmount: Number(newAmount), type, targetAmount: goal?.targetAmount || 0 };
    },
    onSuccess: ({ goalId, newAmount, type, targetAmount }) => {
      queryClient.setQueryData<SavingGoal[]>(
        [GOALS_KEY, user?.id],
        (old = []) => old.map(g => g.id === goalId ? { ...g, currentAmount: newAmount } : g)
      );
      const progress = (newAmount / targetAmount) * 100;
      if (progress >= 100) {
        toast.success('تبریک! به هدف پس‌انداز خود رسیدید!');
      } else if (progress >= 90) {
        toast.success('تبریک! شما به هدفتان نزدیک شدید!');
      } else {
        toast.success(type === 'deposit' ? 'واریز با موفقیت ثبت شد' : 'برداشت با موفقیت ثبت شد');
      }
    },
    onError: () => toast.error('خطا در ثبت تراکنش'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('saving_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<SavingGoal[]>(
        [GOALS_KEY, user?.id],
        (old = []) => old.filter(g => g.id !== id)
      );
      toast.success('هدف پس‌انداز با موفقیت حذف شد');
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
