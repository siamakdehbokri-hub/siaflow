import { useEffect, useState } from 'react';
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

export function useSavingGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData: SavingGoal[] = (data || []).map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.target_amount),
        currentAmount: Number(g.current_amount),
        color: g.color,
        icon: g.icon,
        deadline: g.deadline || undefined,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      }));

      setGoals(mappedData);
    } catch (error: any) {
      console.error('Error fetching saving goals:', error);
      toast.error('خطا در بارگذاری اهداف پس‌انداز');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user?.id]);

  const addGoal = async (goal: Omit<SavingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => {
    if (!user) return;

    try {
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

      const newGoal: SavingGoal = {
        id: data.id,
        name: data.name,
        targetAmount: Number(data.target_amount),
        currentAmount: Number(data.current_amount),
        color: data.color,
        icon: data.icon,
        deadline: data.deadline || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setGoals([newGoal, ...goals]);
      toast.success('هدف پس‌انداز با موفقیت ایجاد شد');
    } catch (error: any) {
      console.error('Error adding goal:', error);
      toast.error('خطا در ایجاد هدف');
    }
  };

  const updateGoalAmount = async (goalId: string, amount: number, type: 'deposit' | 'withdraw', note?: string) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = type === 'deposit' 
      ? goal.currentAmount + amount 
      : Math.max(0, goal.currentAmount - amount);

    try {
      // Update goal amount
      const { error: updateError } = await supabase
        .from('saving_goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: txError } = await supabase
        .from('saving_goal_transactions')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          amount,
          type,
          note: note || null,
        });

      if (txError) throw txError;

      setGoals(goals.map(g => 
        g.id === goalId ? { ...g, currentAmount: newAmount } : g
      ));

      // Check if close to goal
      const progress = (newAmount / goal.targetAmount) * 100;
      if (progress >= 90 && progress < 100) {
        toast.success('🎉 تبریک! شما به هدفتان نزدیک شدید!');
      } else if (progress >= 100) {
        toast.success('🏆 تبریک! به هدف پس‌انداز خود رسیدید!');
      } else {
        toast.success(type === 'deposit' ? 'واریز با موفقیت ثبت شد' : 'برداشت با موفقیت ثبت شد');
      }
    } catch (error: any) {
      console.error('Error updating goal amount:', error);
      toast.error('خطا در ثبت تراکنش');
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saving_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== id));
      toast.success('هدف پس‌انداز با موفقیت حذف شد');
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast.error('خطا در حذف هدف');
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoalAmount,
    deleteGoal,
    refetch: fetchGoals,
  };
}