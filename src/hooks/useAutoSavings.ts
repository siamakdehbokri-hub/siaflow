import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction } from '@/types/expense';
import { getCurrentJalaliMonthBounds, getPreviousJalaliMonthBounds } from '@/utils/persianDate';
import { endOfMonth, getDaysInMonth, getDate } from 'date-fns-jalali';

export interface AutoSavingsPreferences {
  /** Number of consecutive months user accepted the suggestion */
  acceptCount: number;
  /** Whether user enabled auto-transfer */
  autoTransferEnabled: boolean;
  /** Preferred savings percentage (learned from history) */
  suggestedPercentage: number;
  /** Last month a suggestion was shown (Jalali month key) */
  lastSuggestedMonth: string | null;
  /** Last month user dismissed */
  lastDismissedMonth: string | null;
}

export interface AutoSavingsSuggestion {
  remainingBalance: number;
  suggestedAmount: number;
  suggestedPercentage: number;
  daysUntilMonthEnd: number;
  isEndOfMonth: boolean;
  isNewMonth: boolean;
  hasRecurringUnpaid: boolean;
  recurringUnpaidTotal: number;
  canAutomate: boolean;
  previousMonthRemaining: number;
}

const PREFS_KEY = 'siaflow-auto-savings-prefs';
const END_DAYS_THRESHOLD = 3; // Show suggestion when ≤3 days remain
const START_DAYS_THRESHOLD = 5; // Show suggestion in first 5 days of new month

function loadPrefs(): AutoSavingsPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    acceptCount: 0,
    autoTransferEnabled: false,
    suggestedPercentage: 20,
    lastSuggestedMonth: null,
    lastDismissedMonth: null,
  };
}

function savePrefs(prefs: AutoSavingsPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function useAutoSavings(transactions: Transaction[]) {
  const [prefs, setPrefs] = useState<AutoSavingsPreferences>(loadPrefs);
  const [isDismissed, setIsDismissed] = useState(false);

  const suggestion = useMemo<AutoSavingsSuggestion | null>(() => {
    const now = new Date();
    const jalaliDay = getDate(now);
    const jalaliDaysInMonth = getDaysInMonth(now);
    const daysRemaining = jalaliDaysInMonth - jalaliDay;
    const isEndOfMonth = daysRemaining <= END_DAYS_THRESHOLD;
    const isNewMonth = jalaliDay <= START_DAYS_THRESHOLD;

    // If neither end of month nor start of new month, don't show
    if (!isEndOfMonth && !isNewMonth) return null;

    const { start: curStart, end: curEnd } = getCurrentJalaliMonthBounds();
    const { start: prevStart, end: prevEnd } = getPreviousJalaliMonthBounds();

    // Calculate previous month's balance
    const prevMonthTx = transactions.filter(t => t.date >= prevStart && t.date <= prevEnd);
    const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevSavings = prevMonthTx.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
    const previousMonthRemaining = prevIncome - prevExpense - prevSavings;

    // Calculate current month's balance
    const curMonthTx = transactions.filter(t => t.date >= curStart && t.date <= curEnd);
    const curIncome = curMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const curExpense = curMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const curSavings = curMonthTx.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
    const currentRemaining = curIncome - curExpense - curSavings;

    // For new month: suggest based on previous month remaining
    // For end of month: suggest based on current month remaining
    const baseRemaining = isNewMonth ? previousMonthRemaining : currentRemaining;

    if (baseRemaining <= 0) return null;

    // Detect recurring expenses that haven't been paid this month
    const recurringExpenses = transactions.filter(t => t.isRecurring && t.type === 'expense');
    const recurringCategories = [...new Set(recurringExpenses.map(t => t.category))];
    const unpaidRecurring = recurringCategories.filter(cat => {
      return !curMonthTx.some(t => t.type === 'expense' && t.category === cat);
    });
    
    const recurringUnpaidTotal = unpaidRecurring.reduce((sum, cat) => {
      const prevAmount = prevMonthTx
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
      return sum + prevAmount;
    }, 0);

    // Only deduct recurring for end-of-month (not new month, since those are for previous month's balance)
    const safeRemaining = isNewMonth 
      ? baseRemaining 
      : Math.max(0, baseRemaining - recurringUnpaidTotal);
    
    const percentage = prefs.suggestedPercentage;
    const suggestedAmount = Math.round(safeRemaining * (percentage / 100));

    if (suggestedAmount <= 0) return null;

    return {
      remainingBalance: baseRemaining,
      suggestedAmount,
      suggestedPercentage: percentage,
      daysUntilMonthEnd: daysRemaining,
      isEndOfMonth,
      isNewMonth,
      hasRecurringUnpaid: !isNewMonth && recurringUnpaidTotal > 0,
      recurringUnpaidTotal: isNewMonth ? 0 : recurringUnpaidTotal,
      canAutomate: prefs.acceptCount >= 3,
      previousMonthRemaining,
    };
  }, [transactions, prefs.suggestedPercentage, prefs.acceptCount]);

  // Check if we already showed/dismissed for this month
  const currentMonthKey = useMemo(() => {
    const { start } = getCurrentJalaliMonthBounds();
    return start;
  }, []);

  const shouldShow = useMemo(() => {
    if (!suggestion) return false;
    if (isDismissed) return false;
    if (prefs.lastDismissedMonth === currentMonthKey) return false;
    if (prefs.autoTransferEnabled) return false; // auto-mode, no prompt needed
    return true;
  }, [suggestion, isDismissed, prefs.lastDismissedMonth, prefs.autoTransferEnabled, currentMonthKey]);

  const acceptSuggestion = useCallback((amount: number) => {
    const newPrefs: AutoSavingsPreferences = {
      ...prefs,
      acceptCount: prefs.acceptCount + 1,
      lastSuggestedMonth: currentMonthKey,
      // Learn: adjust percentage based on user's chosen amount vs remaining
      suggestedPercentage: suggestion
        ? Math.round((amount / suggestion.remainingBalance) * 100)
        : prefs.suggestedPercentage,
    };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
    setIsDismissed(true);
    return amount;
  }, [prefs, currentMonthKey, suggestion]);

  const declineSuggestion = useCallback(() => {
    const newPrefs: AutoSavingsPreferences = {
      ...prefs,
      lastDismissedMonth: currentMonthKey,
      acceptCount: Math.max(0, prefs.acceptCount - 1),
    };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
    setIsDismissed(true);
  }, [prefs, currentMonthKey]);

  const enableAutoTransfer = useCallback(() => {
    const newPrefs: AutoSavingsPreferences = {
      ...prefs,
      autoTransferEnabled: true,
    };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  }, [prefs]);

  const disableAutoTransfer = useCallback(() => {
    const newPrefs: AutoSavingsPreferences = {
      ...prefs,
      autoTransferEnabled: false,
    };
    setPrefs(newPrefs);
    savePrefs(newPrefs);
  }, [prefs]);

  return {
    suggestion,
    shouldShow,
    prefs,
    acceptSuggestion,
    declineSuggestion,
    enableAutoTransfer,
    disableAutoTransfer,
  };
}
