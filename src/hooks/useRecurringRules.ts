import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'saving';
  category: string;
  subcategory?: string;
  accountId?: string;
  description?: string;
  frequency: RecurringFrequency;
  intervalCount: number;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  lastRunDate?: string;
  isActive: boolean;
}

export type RecurringRuleInput = Omit<RecurringRule, 'id' | 'nextRunDate' | 'lastRunDate'> & {
  nextRunDate?: string;
};

const KEY = 'recurring-rules';
const EMPTY: RecurringRule[] = [];

function mapRow(r: Record<string, unknown>): RecurringRule {
  return {
    id: r.id as string,
    name: r.name as string,
    amount: Number(r.amount),
    type: r.type as RecurringRule['type'],
    category: r.category as string,
    subcategory: (r.subcategory as string) || undefined,
    accountId: (r.account_id as string) || undefined,
    description: (r.description as string) || undefined,
    frequency: r.frequency as RecurringFrequency,
    intervalCount: Number(r.interval_count ?? 1),
    startDate: r.start_date as string,
    endDate: (r.end_date as string) || undefined,
    nextRunDate: r.next_run_date as string,
    lastRunDate: (r.last_run_date as string) || undefined,
    isActive: Boolean(r.is_active),
  };
}

export function useRecurringRules() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rules = EMPTY, isLoading: loading } = useQuery({
    queryKey: [KEY, user?.id],
    queryFn: async () => {
      if (!user) return EMPTY;
      const { data, error } = await supabase
        .from('recurring_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('next_run_date', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [KEY, user?.id] });
    queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
  };

  const addRule = useMutation({
    mutationFn: async (input: RecurringRuleInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('recurring_rules').insert({
        user_id: user.id,
        name: input.name,
        amount: Math.round(input.amount),
        type: input.type,
        category: input.category,
        subcategory: input.subcategory ?? null,
        account_id: input.accountId ?? null,
        description: input.description ?? null,
        frequency: input.frequency,
        interval_count: input.intervalCount,
        start_date: input.startDate,
        end_date: input.endDate ?? null,
        next_run_date: input.nextRunDate || input.startDate,
        is_active: input.isActive,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('قانون تکرار ثبت شد');
    },
    onError: (e: Error) => toast.error(e.message || 'خطا در ثبت قانون'),
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...input }: Partial<RecurringRuleInput> & { id: string }) => {
      const payload: Record<string, unknown> = {};
      if (input.name !== undefined) payload.name = input.name;
      if (input.amount !== undefined) payload.amount = Math.round(input.amount);
      if (input.type !== undefined) payload.type = input.type;
      if (input.category !== undefined) payload.category = input.category;
      if (input.subcategory !== undefined) payload.subcategory = input.subcategory ?? null;
      if (input.accountId !== undefined) payload.account_id = input.accountId ?? null;
      if (input.description !== undefined) payload.description = input.description ?? null;
      if (input.frequency !== undefined) payload.frequency = input.frequency;
      if (input.intervalCount !== undefined) payload.interval_count = input.intervalCount;
      if (input.startDate !== undefined) payload.start_date = input.startDate;
      if (input.endDate !== undefined) payload.end_date = input.endDate ?? null;
      if (input.nextRunDate !== undefined) payload.next_run_date = input.nextRunDate;
      if (input.isActive !== undefined) payload.is_active = input.isActive;
      const { error } = await supabase
        .from('recurring_rules')
        .update(payload as never)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message || 'خطا در به‌روزرسانی'),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recurring_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('قانون حذف شد');
    },
    onError: (e: Error) => toast.error(e.message || 'خطا در حذف'),
  });

  const runNow = async () => {
    const { data, error } = await supabase.functions.invoke('run-recurring', { body: {} });
    if (error) throw error;
    invalidate();
    return data as { created: number };
  };

  return {
    rules,
    loading,
    addRule: (input: RecurringRuleInput) => addRule.mutateAsync(input),
    updateRule: (input: Partial<RecurringRuleInput> & { id: string }) => updateRule.mutateAsync(input),
    deleteRule: (id: string) => deleteRule.mutateAsync(id),
    runNow,
  };
}

/** Runs the recurring engine once per day when the app opens. */
export function useRecurringRunner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (!user || ran.current) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `siaflow-recurring-run-${user.id}`;
    if (localStorage.getItem(key) === today) return;
    ran.current = true;

    supabase.functions
      .invoke('run-recurring', { body: {} })
      .then(({ data, error }) => {
        if (error) return;
        localStorage.setItem(key, today);
        const created = (data as { created?: number })?.created || 0;
        if (created > 0) {
          queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
          queryClient.invalidateQueries({ queryKey: [KEY, user.id] });
          toast.success(`${created} تراکنش تکرارشونده به‌صورت خودکار ثبت شد`);
        }
      })
      .catch(() => undefined);
  }, [user?.id, queryClient]);
}
