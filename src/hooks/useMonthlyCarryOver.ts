import { useEffect, useMemo, useState } from 'react';
import { Transaction } from '@/types/expense';
import {
  calculateMonthCarryOver,
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
  const data = useMemo(() => calculateMonthCarryOver(transactions), [transactions]);

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
