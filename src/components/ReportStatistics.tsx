import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, Award, Calculator, Percent, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction, Category } from '@/types/expense';
import { formatCurrency, toPersianNum } from '@/utils/persianDate';
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
        balance: 0,
        avgTransaction: 0,
        avgDailyExpense: 0,
        topCategory: { name: '-', amount: 0 },
        overBudgetCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        totalCount: 0,
        savingsRate: 0,
        growthRate: 0,
        medianExpense: 0,
      };
    }

    // Total income and expense with validation
    const incomeTransactions = transactions.filter(t => t.type === 'income' && t.amount > 0);
    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.amount > 0);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // Calculate savings rate (percentage of income saved)
    // Formula: (Income - Expense) / Income * 100
    const savingsRate = totalIncome > 0 
      ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) 
      : 0;

    // Calculate average transaction amount
    const avgTransaction = transactions.length > 0 
      ? Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)
      : 0;

    // Calculate median expense (more robust than average for outliers)
    const sortedExpenses = expenseTransactions
      .map(t => t.amount)
      .sort((a, b) => a - b);
    const medianExpense = sortedExpenses.length > 0
      ? sortedExpenses[Math.floor(sortedExpenses.length / 2)]
      : 0;

    // Calculate average daily expense
    const dates = transactions.map(t => new Date(t.date).toDateString());
    const uniqueDays = [...new Set(dates)].length;
    const avgDailyExpense = uniqueDays > 0 
      ? Math.round(totalExpense / uniqueDays)
      : 0;

    // Category spending analysis
    const categorySpending: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    // Top spending category
    let topCategory = { name: '-', amount: 0 };
    Object.entries(categorySpending).forEach(([name, amount]) => {
      if (amount > topCategory.amount) {
        topCategory = { name, amount };
      }
    });

    // Over budget categories with accurate calculation
    const overBudgetCategories = categories.filter(c => {
      if (!c.budget || c.budget <= 0) return false;
      const spent = categorySpending[c.name] || 0;
      return spent > c.budget;
    });

    // Calculate month-over-month growth rate
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthExpense = expenseTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthExpense = expenseTransactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Growth rate formula: ((Current - Previous) / Previous) * 100
    const growthRate = lastMonthExpense > 0 
      ? Math.round(((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100)
      : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      avgTransaction,
      avgDailyExpense,
      topCategory,
      overBudgetCount: overBudgetCategories.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      totalCount: transactions.length,
      savingsRate,
      growthRate,
      medianExpense,
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
      subtext: `${toPersianNum(stats.expenseCount)} تراکنش`,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'موجودی خالص',
      value: formatCurrency(Math.abs(stats.balance)),
      subtext: stats.balance >= 0 ? 'مثبت ✓' : 'منفی ✗',
      icon: Wallet,
      color: stats.balance >= 0 ? 'text-success' : 'text-destructive',
      bgColor: stats.balance >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      label: 'نرخ پس‌انداز',
      value: `${toPersianNum(Math.max(0, stats.savingsRate))}٪`,
      subtext: stats.savingsRate > 20 ? 'عالی' : stats.savingsRate > 10 ? 'خوب' : 'نیاز به بهبود',
      icon: Percent,
      color: stats.savingsRate > 20 ? 'text-success' : stats.savingsRate > 10 ? 'text-warning' : 'text-destructive',
      bgColor: stats.savingsRate > 20 ? 'bg-success/10' : stats.savingsRate > 10 ? 'bg-warning/10' : 'bg-destructive/10',
    },
    {
      label: 'میانگین روزانه',
      value: formatCurrency(stats.avgDailyExpense),
      subtext: 'هزینه روزانه',
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
      label: 'رشد ماهانه',
      value: `${stats.growthRate >= 0 ? '+' : ''}${toPersianNum(stats.growthRate)}٪`,
      subtext: stats.growthRate > 0 ? 'افزایش هزینه' : stats.growthRate < 0 ? 'کاهش هزینه' : 'بدون تغییر',
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
