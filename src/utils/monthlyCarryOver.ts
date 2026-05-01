/**
 * Monthly Carry-Over Engine (Jalali)
 *
 * Rules (per user spec):
 * 1. Net positive balance (income - expense - saving) of previous month
 *    is carried forward as "available carry-over" into the new month's budget.
 * 2. Previous month savings are accumulated separately (cumulative savings).
 * 3. Negative balance (overspend) is NEVER carried — only a warning is shown.
 * 4. All boundaries strictly use the Jalali calendar.
 */

import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { Transaction } from '@/types/expense';
import { toLocalISODateString } from '@/utils/dateUtils';

export interface MonthCarryOverData {
  /** Jalali month key of the previous month, e.g. "1404-02" */
  previousMonthKey: string;
  /** Persian label, e.g. "اردیبهشت ۱۴۰۴" */
  previousMonthLabel: string;
  /** Net balance of previous month (income - expense - saving). Can be negative. */
  previousNetBalance: number;
  /** Savings amount of previous month (always >= 0). */
  previousSavings: number;
  /** Carry-over amount actually applied to current month. Always >= 0. */
  carriedAmount: number;
  /** True when previous month ended in deficit (overspend). */
  hadDeficit: boolean;
  /** Absolute deficit amount, useful for warnings. */
  deficitAmount: number;
  /** Cumulative savings across ALL prior months (since first transaction). */
  cumulativeSavings: number;
  /** Jalali month key of the current month, e.g. "1404-03" */
  currentMonthKey: string;
  /** Persian label of the current month. */
  currentMonthLabel: string;
}

/**
 * Compute carry-over data for the current Jalali month based on transactions.
 * Pure function — no side effects, safe to memoize.
 */
export function calculateMonthCarryOver(transactions: Transaction[]): MonthCarryOverData {
  const now = new Date();
  const prevDate = subMonths(now, 1);

  const prevStart = toLocalISODateString(startOfMonth(prevDate));
  const prevEnd = toLocalISODateString(endOfMonth(prevDate));
  const currentMonthKey = format(now, 'yyyy-MM', { locale: faIR });
  const currentMonthLabel = format(now, 'MMMM yyyy', { locale: faIR });
  const previousMonthKey = format(prevDate, 'yyyy-MM', { locale: faIR });
  const previousMonthLabel = format(prevDate, 'MMMM yyyy', { locale: faIR });

  // Strictly previous-month transactions
  const prevTx = transactions.filter((t) => t.date >= prevStart && t.date <= prevEnd);
  const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevSavings = prevTx.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const previousNetBalance = prevIncome - prevExpense - prevSavings;

  const hadDeficit = previousNetBalance < 0;
  const deficitAmount = hadDeficit ? Math.abs(previousNetBalance) : 0;
  const carriedAmount = hadDeficit ? 0 : previousNetBalance;

  // Cumulative savings across ALL transactions BEFORE current month start
  const currentMonthStart = toLocalISODateString(startOfMonth(now));
  const cumulativeSavings = transactions
    .filter((t) => t.type === 'saving' && t.date < currentMonthStart)
    .reduce((s, t) => s + t.amount, 0);

  return {
    previousMonthKey,
    previousMonthLabel,
    previousNetBalance,
    previousSavings: prevSavings,
    carriedAmount,
    hadDeficit,
    deficitAmount,
    cumulativeSavings,
    currentMonthKey,
    currentMonthLabel,
  };
}

const SEEN_MONTH_KEY = 'siaflow:lastSeenMonthKey';
const ANNOUNCED_KEY = 'siaflow:carryOverAnnouncedFor';

/**
 * Returns true exactly once when the user opens the app in a NEW Jalali month
 * compared to their last visit. Persists state in localStorage.
 */
export function detectMonthRollover(currentMonthKey: string): {
  isNewMonth: boolean;
  previousSeenKey: string | null;
} {
  if (typeof window === 'undefined') return { isNewMonth: false, previousSeenKey: null };
  const previousSeenKey = window.localStorage.getItem(SEEN_MONTH_KEY);
  const isNewMonth = previousSeenKey !== null && previousSeenKey !== currentMonthKey;
  window.localStorage.setItem(SEEN_MONTH_KEY, currentMonthKey);
  return { isNewMonth, previousSeenKey };
}

/**
 * Track whether the carry-over banner/toast for the current month has been shown.
 */
export function hasAnnouncedCarryOver(currentMonthKey: string): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(ANNOUNCED_KEY) === currentMonthKey;
}

export function markCarryOverAnnounced(currentMonthKey: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ANNOUNCED_KEY, currentMonthKey);
}
