import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Award, Calculator, Percent, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction, Category } from '@/types/expense';
import { formatCurrency, toPersianNum } from '@/utils/persianDate';
import { getCurrentMonthSummary, filterTransactionsByDateRange } from '@/utils/financialEngine';
import { cn } from '@/lib/utils';

interface ReportStatisticsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function ReportStatistics({ transactions, categories }: ReportStatisticsProps) {
  const stats = useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        totalSaving: 0,
        balance: 0,
        avgDailyExpense: 0,
        topCategory: { name: '-', amount: 0 },
        overBudgetCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        savingCount: 0,
        totalCount: 0,
        savingsRate: 0,
        growthRate: 0,
        medianExpense: 0,
        expenseToIncomeRatio: 0,
      };
    }

    // Use financial engine for FILTERED transactions (respects user's date range)
    // The filtered transactions come from ReportingFilters, so we calculate directly on them
    const incomeTransactions = transactions.filter(t => t.type === 'income' && t.amount > 0);
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.amount > 0);
    const savingTransactions = transactions.filter(t => t.type === 'saving' && t.amount > 0);

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalSaving = savingTransactions.reduce((sum, t) => sum + t.amount, 0);
    // Net balance = Income - Expense - Saving
    const balance = totalIncome - totalExpense - totalSaving;

    // Savings rate: (Saving / Income) * 100
    const savingsRate = totalIncome > 0 ? Math.round((totalSaving / totalIncome) * 100) : 0;
    const expenseToIncomeRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

    // Median expense (more robust than average)
    const sortedExpenses = expenseTransactions.map(t => t.amount).sort((a, b) => a - b);
    const medianExpense = sortedExpenses.length > 0
      ? sortedExpenses[Math.floor(sortedExpenses.length / 2)]
      : 0;

    // Average daily expense (unique days in filtered range)
    const expenseDays = new Set(expenseTransactions.map(t => t.date));
    const uniqueDays = expenseDays.size || 1;
    const avgDailyExpense = Math.round(totalExpense / uniqueDays);

    // Category spending with integrity check
    const categorySpending = new Map<string, number>();
    expenseTransactions.forEach(t => {
      categorySpending.set(t.category, (categorySpending.get(t.category) || 0) + t.amount);
    });

    // INTEGRITY: Verify category sum equals total
    const categorySum = Array.from(categorySpending.values()).reduce((s, v) => s + v, 0);
    if (categorySum !== totalExpense) {
      console.warn(`[ReportStatistics] Integrity: categorySum=${categorySum} != totalExpense=${totalExpense}`);
    }

    // Top spending category
    let topCategory = { name: '-', amount: 0 };
    categorySpending.forEach((amount, name) => {
      if (amount > topCategory.amount) {
        topCategory = { name, amount };
      }
    });

    // Over budget categories
    const overBudgetCount = categories.filter(c => {
      if (!c.budget || c.budget <= 0) return false;
      const spent = categorySpending.get(c.name) || 0;
      return spent > c.budget;
    }).length;

    // Growth rate: compare first half vs second half of filtered data to detect trend
    // This works regardless of date range selected
    const sortedByDate = [...expenseTransactions].sort((a, b) => a.date.localeCompare(b.date));
    let growthRate = 0;
    if (sortedByDate.length >= 4) {
      const mid = Math.floor(sortedByDate.length / 2);
      const firstHalf = sortedByDate.slice(0, mid).reduce((s, t) => s + t.amount, 0);
      const secondHalf = sortedByDate.slice(mid).reduce((s, t) => s + t.amount, 0);
      if (firstHalf > 0) {
        growthRate = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
      }
    }

    return {
      totalIncome,
      totalExpense,
      totalSaving,
      balance,
      avgDailyExpense,
      topCategory,
      overBudgetCount,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      savingCount: savingTransactions.length,
      totalCount: transactions.length,
      savingsRate,
      growthRate,
      medianExpense,
      expenseToIncomeRatio,
    };
  }, [transactions, categories]);

  const statCards = [
    {
      label: 'کل درآمد',
      value: formatCurrency(stats.totalIncome),
      subtext: `${toPersianNum(stats.incomeCount)} تراکنش`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'کل هزینه',
      value: formatCurrency(stats.totalExpense),
      subtext: `${toPersianNum(stats.expenseCount)} تراکنش | ${toPersianNum(stats.expenseToIncomeRatio)}٪ از درآمد`,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'مانده خالص',
      value: formatCurrency(Math.abs(stats.balance)),
      subtext: stats.balance >= 0 ? 'مثبت' : 'منفی',
      icon: Wallet,
      color: stats.balance >= 0 ? 'text-success' : 'text-destructive',
      bgColor: stats.balance >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      label: 'نرخ پس‌انداز',
      value: `${toPersianNum(Math.max(0, stats.savingsRate))}٪`,
      subtext: stats.savingsRate >= 20 ? 'عالی (≥۲۰٪)' : stats.savingsRate >= 10 ? 'خوب' : 'نیاز به بهبود (<۱۰٪)',
      icon: Percent,
      color: stats.savingsRate >= 20 ? 'text-success' : stats.savingsRate >= 10 ? 'text-warning' : 'text-destructive',
      bgColor: stats.savingsRate >= 20 ? 'bg-success/10' : stats.savingsRate >= 10 ? 'bg-warning/10' : 'bg-destructive/10',
    },
    {
      label: 'میانگین روزانه',
      value: formatCurrency(stats.avgDailyExpense),
      subtext: `میانه: ${formatCurrency(stats.medianExpense)}`,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'بیشترین هزینه',
      value: stats.topCategory.name,
      subtext: formatCurrency(stats.topCategory.amount),
      icon: Award,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'روند هزینه',
      value: `${stats.growthRate >= 0 ? '+' : ''}${toPersianNum(stats.growthRate)}٪`,
      subtext: stats.growthRate > 0 ? 'افزایشی' : stats.growthRate < 0 ? 'کاهشی' : 'ثابت',
      icon: Calculator,
      color: stats.growthRate <= 0 ? 'text-success' : 'text-destructive',
      bgColor: stats.growthRate <= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      label: 'دسته‌های پرخطر',
      value: toPersianNum(stats.overBudgetCount),
      subtext: stats.overBudgetCount > 0 ? 'بیش از بودجه' : 'همه در بودجه',
      icon: AlertTriangle,
      color: stats.overBudgetCount > 0 ? 'text-destructive' : 'text-success',
      bgColor: stats.overBudgetCount > 0 ? 'bg-destructive/10' : 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            variant="glass" 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2.5">
                <div className={cn("p-2 rounded-xl shrink-0", stat.bgColor)}>
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className={cn(
                    "font-bold text-sm sm:text-base truncate",
                    stat.label === 'بیشترین هزینه' ? 'text-foreground' : stat.color
                  )}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{stat.subtext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
