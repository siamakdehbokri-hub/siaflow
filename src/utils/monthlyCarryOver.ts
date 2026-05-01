/**
 * Monthly Carry-Over Engine (Jalali)
 *
 * Rules (per user spec):
 * 1. Activation date is "today" the first time the user lands on the app after
 *    this feature is deployed. Persisted in localStorage as YYYY-MM-DD.
 * 2. NOTHING is carried or accumulated for the activation month itself.
 *    The first carry-over happens when the user enters the month AFTER the
 *    activation month (i.e. activation month is the first "source" month).
 * 3. Net positive balance (income - expense - saving) of previous month
 *    is carried into the new month's net balance.
 * 4. Cumulative savings include ONLY savings dated on/after the activation
 *    date AND strictly before the current Jalali month start.
 * 5. Negative balance (overspend) is NEVER carried — only a warning is shown.
 * 6. All boundaries strictly use the Jalali calendar.
 */

import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import type { Transaction } from '@/types/expense';
import { toLocalISODateString } from '@/utils/dateUtils';

export interface MonthCarryOverData {
  /** Activation date (ISO YYYY-MM-DD) — feature ignores anything before this. */
  activationDate: string;
  /** Jalali month key of the activation month, e.g. "1404-03". */
  activationMonthKey: string;
  /** True until the user reaches a Jalali month strictly AFTER activation month. */
  isPreActivation: boolean;

  /** Jalali month key of the previous month, e.g. "1404-02" */
  previousMonthKey: string;
  /** Persian label, e.g. "اردیبهشت ۱۴۰۴" */
  previousMonthLabel: string;
  /** Net balance of previous month (income - expense - saving). Can be negative. Always 0 in pre-activation. */
  previousNetBalance: number;
  /** Savings amount of previous month (always >= 0). Always 0 in pre-activation. */
  previousSavings: number;
  /** Carry-over amount actually applied to current month. Always >= 0. Always 0 in pre-activation. */
  carriedAmount: number;
  /** True when previous month ended in deficit (overspend). Always false in pre-activation. */
  hadDeficit: boolean;
  /** Absolute deficit amount, useful for warnings. */
  deficitAmount: number;
  /** Cumulative savings since activation date, strictly before current month start. 0 in pre-activation. */
  cumulativeSavings: number;
  /** Jalali month key of the current month, e.g. "1404-03" */
  currentMonthKey: string;
  /** Persian label of the current month. */
  currentMonthLabel: string;
}

const ACTIVATION_DATE_KEY = 'siaflow:carryOverActivationDate';
const SEEN_MONTH_KEY = 'siaflow:lastSeenMonthKey';
const ANNOUNCED_KEY = 'siaflow:carryOverAnnouncedFor';

/**
 * Get (and lazily set) the activation date in YYYY-MM-DD (local).
 * The first call writes today's date; subsequent calls return that same date.
 */
export function getOrInitActivationDate(): string {
  const today = toLocalISODateString(new Date());
  if (typeof window === 'undefined') return today;
  const existing = window.localStorage.getItem(ACTIVATION_DATE_KEY);
  if (existing && /^\d{4}-\d{2}-\d{2}$/.test(existing)) return existing;
  window.localStorage.setItem(ACTIVATION_DATE_KEY, today);
  return today;
}

/**
 * Compute carry-over data for the current Jalali month.
 * Pure-ish: only side effect is the lazy initialization of the activation date.
 */
export function calculateMonthCarryOver(transactions: Transaction[]): MonthCarryOverData {
  const activationDate = getOrInitActivationDate();
  const activationMonthKey = format(new Date(activationDate), 'yyyy-MM', { locale: faIR });

  const now = new Date();
  const prevDate = subMonths(now, 1);

  const currentMonthStart = toLocalISODateString(startOfMonth(now));
  const prevStart = toLocalISODateString(startOfMonth(prevDate));
  const prevEnd = toLocalISODateString(endOfMonth(prevDate));
  const currentMonthKey = format(now, 'yyyy-MM', { locale: faIR });
  const currentMonthLabel = format(now, 'MMMM yyyy', { locale: faIR });
  const previousMonthKey = format(prevDate, 'yyyy-MM', { locale: faIR });
  const previousMonthLabel = format(prevDate, 'MMMM yyyy', { locale: faIR });

  // Pre-activation: we are still in (or before) the activation month.
  // Don't carry anything yet. The first effective carry-over happens once the
  // user enters the month AFTER activation.
  const isPreActivation = currentMonthKey <= activationMonthKey;

  if (isPreActivation) {
    return {
      activationDate,
      activationMonthKey,
      isPreActivation: true,
      previousMonthKey,
      previousMonthLabel,
      previousNetBalance: 0,
      previousSavings: 0,
      carriedAmount: 0,
      hadDeficit: false,
      deficitAmount: 0,
      cumulativeSavings: 0,
      currentMonthKey,
      currentMonthLabel,
    };
  }

  // Previous-month transactions, but ONLY counting from activation date onward.
  // (If activation falls inside the previous month, anything before it is ignored.)
  const effectivePrevStart = activationDate > prevStart ? activationDate : prevStart;
  const prevTx = transactions.filter(
    (t) => t.date >= effectivePrevStart && t.date <= prevEnd,
  );
  const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevSavings = prevTx.filter((t) => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
  const previousNetBalance = prevIncome - prevExpense - prevSavings;

  const hadDeficit = previousNetBalance < 0;
  const deficitAmount = hadDeficit ? Math.abs(previousNetBalance) : 0;
  const carriedAmount = hadDeficit ? 0 : previousNetBalance;

  // Cumulative savings: from activation date (inclusive) up to (but not including)
  // the current Jalali month start. Anything before activation is ignored.
  const cumulativeSavings = transactions
    .filter(
      (t) =>
        t.type === 'saving' &&
        t.date >= activationDate &&
        t.date < currentMonthStart,
    )
    .reduce((s, t) => s + t.amount, 0);

  return {
    activationDate,
    activationMonthKey,
    isPreActivation: false,
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
