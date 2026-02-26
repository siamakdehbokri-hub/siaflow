/**
 * Financial Calculation Engine
 * 
 * Core principles:
 * 1. Strict monthly isolation using Jalali calendar boundaries
 * 2. No cross-month data mixing
 * 3. Precise integer arithmetic (amounts are stored as integers in Rials/Tomans)
 * 4. Category totals must always equal month totals (integrity check)
 * 5. Growth rates calculated per-month vs previous month
 */

import { Transaction, Category } from '@/types/expense';
import { 
  getJalaliMonthKey, 
  getJalaliMonthName,
  getCurrentJalaliMonthBounds,
  getPreviousJalaliMonthBounds,
} from '@/utils/persianDate';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { toLocalISODateString } from '@/utils/dateUtils';

// ─── Types ───────────────────────────────────────────────────

export interface MonthlyFinancialSummary {
  monthKey: string;           // e.g. "1404-03"
  monthLabel: string;         // e.g. "خرداد ۱۴۰۴"
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  netBalance: number;         // income - expense - saving
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  savingCount: number;
  avgDailyExpense: number;
  medianExpense: number;
  savingsRate: number;        // (saving / income) * 100
  expenseToIncomeRatio: number; // (expense / income) * 100
  categoryBreakdown: CategoryMonthlyData[];
  // Comparison with previous month
  growthRate: {
    income: number;     // percentage change
    expense: number;
    saving: number;
    netBalance: number;
  };
}

export interface CategoryMonthlyData {
  categoryName: string;
  totalAmount: number;
  percentage: number;     // percentage of total expense/income in that month
  transactionCount: number;
  avgTransaction: number;
  budget?: number;
  budgetUsedPercent?: number;
  subcategoryBreakdown: SubcategoryData[];
}

export interface SubcategoryData {
  name: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

// ─── Core Functions ──────────────────────────────────────────

/**
 * Get Jalali month bounds for a specific date
 */
export function getJalaliMonthBounds(date: Date): { start: string; end: string; key: string; label: string } {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  return {
    start: toLocalISODateString(monthStart),
    end: toLocalISODateString(monthEnd),
    key: format(date, 'yyyy-MM', { locale: faIR }),
    label: format(date, 'MMMM yyyy', { locale: faIR }),
  };
}

/**
 * Get N months of Jalali month bounds going backwards from now
 */
export function getLastNMonthBounds(n: number): Array<{ start: string; end: string; key: string; label: string }> {
  const months: Array<{ start: string; end: string; key: string; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = subMonths(now, i);
    months.push(getJalaliMonthBounds(d));
  }
  return months.reverse(); // oldest first
}

/**
 * Filter transactions strictly within a date range (inclusive)
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  start: string,
  end: string
): Transaction[] {
  return transactions.filter(t => t.date >= start && t.date <= end);
}

/**
 * Calculate precise monthly summary for a single month
 * This is the core calculation unit — no cross-month data enters here
 */
export function calculateMonthlySummary(
  transactions: Transaction[],
  monthStart: string,
  monthEnd: string,
  monthKey: string,
  monthLabel: string,
  categories: Category[],
  prevMonthSummary?: { totalIncome: number; totalExpense: number; totalSaving: number; netBalance: number } | null,
): MonthlyFinancialSummary {
  // STRICT: only transactions within this month's boundaries
  const monthTx = filterTransactionsByDateRange(transactions, monthStart, monthEnd);

  const incomeTx = monthTx.filter(t => t.type === 'income');
  const expenseTx = monthTx.filter(t => t.type === 'expense');
  const savingTx = monthTx.filter(t => t.type === 'saving');

  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);
  const totalSaving = savingTx.reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense - totalSaving;

  // Average daily expense (unique days with transactions)
  const expenseDays = new Set(expenseTx.map(t => t.date));
  const uniqueExpenseDays = expenseDays.size || 1;
  const avgDailyExpense = Math.round(totalExpense / uniqueExpenseDays);

  // Median expense
  const sortedExpenses = expenseTx.map(t => t.amount).sort((a, b) => a - b);
  const medianExpense = sortedExpenses.length > 0
    ? sortedExpenses[Math.floor(sortedExpenses.length / 2)]
    : 0;

  // Rates
  const savingsRate = totalIncome > 0 ? Math.round((totalSaving / totalIncome) * 100) : 0;
  const expenseToIncomeRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  // Category breakdown (only expense categories for spending analysis)
  const categoryMap = new Map<string, { amount: number; count: number; subcats: Map<string, { amount: number; count: number }> }>();
  
  expenseTx.forEach(t => {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0, subcats: new Map() };
    existing.amount += t.amount;
    existing.count += 1;
    
    if (t.subcategory) {
      const sub = existing.subcats.get(t.subcategory) || { amount: 0, count: 0 };
      sub.amount += t.amount;
      sub.count += 1;
      existing.subcats.set(t.subcategory, sub);
    }
    
    categoryMap.set(t.category, existing);
  });

  const categoryBreakdown: CategoryMonthlyData[] = Array.from(categoryMap.entries())
    .map(([name, data]) => {
      const cat = categories.find(c => c.name === name);
      const percentage = totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0;
      
      const subcategoryBreakdown: SubcategoryData[] = Array.from(data.subcats.entries())
        .map(([subName, subData]) => ({
          name: subName,
          totalAmount: subData.amount,
          percentage: data.amount > 0 ? Math.round((subData.amount / data.amount) * 100) : 0,
          transactionCount: subData.count,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      return {
        categoryName: name,
        totalAmount: data.amount,
        percentage,
        transactionCount: data.count,
        avgTransaction: data.count > 0 ? Math.round(data.amount / data.count) : 0,
        budget: cat?.budget || undefined,
        budgetUsedPercent: cat?.budget && cat.budget > 0 ? Math.round((data.amount / cat.budget) * 100) : undefined,
        subcategoryBreakdown,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // INTEGRITY CHECK: sum of category amounts must equal totalExpense
  const categorySum = categoryBreakdown.reduce((s, c) => s + c.totalAmount, 0);
  if (categorySum !== totalExpense) {
    console.warn(`[FinancialEngine] Integrity check failed for ${monthKey}: categorySum=${categorySum} != totalExpense=${totalExpense}`);
  }

  // Growth rates vs previous month
  const growthRate = {
    income: prevMonthSummary && prevMonthSummary.totalIncome > 0
      ? Math.round(((totalIncome - prevMonthSummary.totalIncome) / prevMonthSummary.totalIncome) * 100)
      : 0,
    expense: prevMonthSummary && prevMonthSummary.totalExpense > 0
      ? Math.round(((totalExpense - prevMonthSummary.totalExpense) / prevMonthSummary.totalExpense) * 100)
      : 0,
    saving: prevMonthSummary && prevMonthSummary.totalSaving > 0
      ? Math.round(((totalSaving - prevMonthSummary.totalSaving) / prevMonthSummary.totalSaving) * 100)
      : 0,
    netBalance: prevMonthSummary && prevMonthSummary.netBalance !== 0
      ? Math.round(((netBalance - prevMonthSummary.netBalance) / Math.abs(prevMonthSummary.netBalance)) * 100)
      : 0,
  };

  return {
    monthKey,
    monthLabel,
    startDate: monthStart,
    endDate: monthEnd,
    totalIncome,
    totalExpense,
    totalSaving,
    netBalance,
    transactionCount: monthTx.length,
    incomeCount: incomeTx.length,
    expenseCount: expenseTx.length,
    savingCount: savingTx.length,
    avgDailyExpense,
    medianExpense,
    savingsRate,
    expenseToIncomeRatio,
    categoryBreakdown,
    growthRate,
  };
}

/**
 * Calculate multiple months of financial summaries
 * Each month is independently calculated, then growth rates are computed sequentially
 */
export function calculateMultiMonthSummaries(
  transactions: Transaction[],
  categories: Category[],
  monthCount: number = 6
): MonthlyFinancialSummary[] {
  const monthBounds = getLastNMonthBounds(monthCount);
  const summaries: MonthlyFinancialSummary[] = [];

  for (let i = 0; i < monthBounds.length; i++) {
    const { start, end, key, label } = monthBounds[i];
    const prevSummary = i > 0 ? summaries[i - 1] : null;
    
    const summary = calculateMonthlySummary(
      transactions, start, end, key, label, categories, prevSummary
    );
    
    summaries.push(summary);
  }

  return summaries;
}

/**
 * Get the current month's summary
 */
export function getCurrentMonthSummary(
  transactions: Transaction[],
  categories: Category[]
): MonthlyFinancialSummary {
  const current = getCurrentJalaliMonthBounds();
  const prev = getPreviousJalaliMonthBounds();
  const now = new Date();
  
  const currentKey = format(now, 'yyyy-MM', { locale: faIR });
  const currentLabel = format(now, 'MMMM yyyy', { locale: faIR });
  
  // Calculate previous month first for growth rates
  const prevDate = subMonths(now, 1);
  const prevKey = format(prevDate, 'yyyy-MM', { locale: faIR });
  const prevLabel = format(prevDate, 'MMMM yyyy', { locale: faIR });
  
  const prevSummary = calculateMonthlySummary(
    transactions, prev.start, prev.end, prevKey, prevLabel, categories, null
  );
  
  return calculateMonthlySummary(
    transactions, current.start, current.end, currentKey, currentLabel, categories, prevSummary
  );
}

/**
 * Prepare month-isolated data for AI analysis
 * Returns structured data per month for the AI to analyze independently
 */
export function prepareAIMonthlyData(
  transactions: Transaction[],
  categories: Category[],
  monthCount: number = 3
): {
  months: Array<{
    monthLabel: string;
    monthKey: string;
    totalIncome: number;
    totalExpense: number;
    totalSaving: number;
    netBalance: number;
    savingsRate: number;
    expenseToIncomeRatio: number;
    growthRate: { income: number; expense: number };
    topCategories: Array<{
      name: string;
      amount: number;
      percentage: number;
      budgetUsedPercent?: number;
      details: Array<{ desc: string; amount: number; sub?: string; date?: string }>;
    }>;
    budgetStatus: Array<{
      name: string;
      spent: number;
      budget: number;
      usedPercent: number;
      status: 'overflow' | 'warning' | 'normal';
    }>;
  }>;
  overall: {
    totalMonths: number;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
    trend: 'improving' | 'declining' | 'stable';
  };
} {
  const summaries = calculateMultiMonthSummaries(transactions, categories, monthCount);
  const activeSummaries = summaries.filter(s => s.transactionCount > 0);

  const months = activeSummaries.map(summary => {
    // Get raw transactions for detail extraction
    const monthTx = filterTransactionsByDateRange(transactions, summary.startDate, summary.endDate);
    
    // Build detailed category info
    const topCategories = summary.categoryBreakdown.slice(0, 8).map(cat => {
      const details = monthTx
        .filter(t => t.type === 'expense' && t.category === cat.categoryName)
        .slice(0, 10)
        .map(t => ({
          desc: t.description || 'بدون توضیح',
          amount: t.amount,
          sub: t.subcategory || undefined,
          date: t.date,
        }));

      return {
        name: cat.categoryName,
        amount: cat.totalAmount,
        percentage: cat.percentage,
        budgetUsedPercent: cat.budgetUsedPercent,
        details,
      };
    });

    // Budget status
    const budgetStatus = categories
      .filter(c => c.budget && c.budget > 0 && c.type === 'expense')
      .map(c => {
        const catData = summary.categoryBreakdown.find(cb => cb.categoryName === c.name);
        const spent = catData?.totalAmount || 0;
        const usedPercent = Math.round((spent / (c.budget || 1)) * 100);
        return {
          name: c.name,
          spent,
          budget: c.budget!,
          usedPercent,
          status: (usedPercent > 100 ? 'overflow' : usedPercent > 80 ? 'warning' : 'normal') as 'overflow' | 'warning' | 'normal',
        };
      });

    return {
      monthLabel: summary.monthLabel,
      monthKey: summary.monthKey,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      totalSaving: summary.totalSaving,
      netBalance: summary.netBalance,
      savingsRate: summary.savingsRate,
      expenseToIncomeRatio: summary.expenseToIncomeRatio,
      growthRate: {
        income: summary.growthRate.income,
        expense: summary.growthRate.expense,
      },
      topCategories,
      budgetStatus,
    };
  });

  // Overall trend
  const avgIncome = activeSummaries.length > 0
    ? Math.round(activeSummaries.reduce((s, m) => s + m.totalIncome, 0) / activeSummaries.length)
    : 0;
  const avgExpense = activeSummaries.length > 0
    ? Math.round(activeSummaries.reduce((s, m) => s + m.totalExpense, 0) / activeSummaries.length)
    : 0;

  // Determine trend from last 2 months
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (activeSummaries.length >= 2) {
    const last = activeSummaries[activeSummaries.length - 1];
    const prev = activeSummaries[activeSummaries.length - 2];
    if (last.netBalance > prev.netBalance) trend = 'improving';
    else if (last.netBalance < prev.netBalance) trend = 'declining';
  }

  return {
    months,
    overall: {
      totalMonths: activeSummaries.length,
      avgMonthlyIncome: avgIncome,
      avgMonthlyExpense: avgExpense,
      trend,
    },
  };
}
