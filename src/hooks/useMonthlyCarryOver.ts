import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/expense';
import {
  calculateMonthCarryOver,
  getOrInitActivationDate,
  setActivationDate,
  detectMonthRollover,
  hasAnnouncedCarryOver,
  markCarryOverAnnounced,
  type MonthCarryOverData,
} from '@/utils/monthlyCarryOver';

export interface UseMonthlyCarryOverResult {
  data: MonthCarryOverData;
  /** True when the user just opened the app in a new Jalali month and has not yet acknowledged it. */
  showAnnouncement: boolean;
  acknowledge: () => void;
}

/**
 * Reactive hook around `calculateMonthCarryOver` that also surfaces a one-time
 * announcement when the Jalali month changes between visits.
 */
export function useMonthlyCarryOver(transactions: Transaction[]): UseMonthlyCarryOverResult {
  const [syncTick, setSyncTick] = useState(0);

  // Keep the activation date identical on every device by syncing it to the
  // user's account (earliest date wins). Otherwise each device shows a
  // different net balance.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const remote = user.user_metadata?.carry_over_activation_date as string | undefined;
        const local = getOrInitActivationDate();
        const valid = (d?: string) => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
        const chosen = valid(remote) && remote! < local ? remote! : local;
        if (chosen !== local) {
          setActivationDate(chosen);
          if (!cancelled) setSyncTick((t) => t + 1);
        }
        if (remote !== chosen && navigator.onLine) {
          await supabase.auth.updateUser({ data: { carry_over_activation_date: chosen } });
        }
      } catch (e) {
        console.warn('carry-over sync failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => calculateMonthCarryOver(transactions), [transactions, syncTick]);

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    const { isNewMonth } = detectMonthRollover(data.currentMonthKey);
    if (isNewMonth && !hasAnnouncedCarryOver(data.currentMonthKey)) {
      setShowAnnouncement(true);
    }
  }, [data.currentMonthKey]);

  const acknowledge = () => {
    markCarryOverAnnounced(data.currentMonthKey);
    setShowAnnouncement(false);
  };

  return { data, showAnnouncement, acknowledge };
}
