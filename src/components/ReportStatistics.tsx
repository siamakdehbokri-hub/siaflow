import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, Award } from 'lucide-react';
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
    // Total income and expense
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Average transaction
    const avgTransaction = transactions.length > 0 
      ? Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)
      : 0;

    // Category analysis
    const categorySpending: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    // Top spending category
    let topCategory = { name: '-', amount: 0 };
    Object.entries(categorySpending).forEach(([name, amount]) => {
      if (amount > topCategory.amount) {
        topCategory = { name, amount };
      }
    });

    // Over budget categories
    const overBudgetCategories = categories.filter(c => {
      if (!c.budget) return false;
      const spent = categorySpending[c.name] || 0;
      return spent > c.budget;
    });

    // Transaction count by type
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;

    return {
      totalIncome,
      totalExpense,
      balance,
      avgTransaction,
      topCategory,
      overBudgetCount: overBudgetCategories.length,
      incomeCount,
      expenseCount,
      totalCount: transactions.length,
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
      label: 'موجودی',
      value: formatCurrency(stats.balance),
      subtext: stats.balance >= 0 ? 'مثبت' : 'منفی',
      icon: Wallet,
      color: stats.balance >= 0 ? 'text-success' : 'text-destructive',
      bgColor: stats.balance >= 0 ? 'bg-success/10' : 'bg-destructive/10',
    },
    {
      label: 'میانگین تراکنش',
      value: formatCurrency(stats.avgTransaction),
      subtext: `از ${toPersianNum(stats.totalCount)} تراکنش`,
      icon: Target,
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
      label: 'دسته‌های خطرناک',
      value: toPersianNum(stats.overBudgetCount),
      subtext: 'بیش از بودجه',
      icon: AlertTriangle,
      color: stats.overBudgetCount > 0 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: stats.overBudgetCount > 0 ? 'bg-destructive/10' : 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.label} 
            variant="glass" 
            className={cn(
              "animate-fade-in",
              index === 4 && "col-span-2 sm:col-span-1"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-xl", stat.bgColor)}>
                  <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn(
                    "font-bold text-sm sm:text-base truncate",
                    stat.label === 'بیشترین هزینه' ? 'text-foreground' : stat.color
                  )}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{stat.subtext}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
