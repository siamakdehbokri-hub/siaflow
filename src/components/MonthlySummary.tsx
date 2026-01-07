import { useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Wallet, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Transaction, Category } from '@/types/expense';
import { formatCurrency, getJalaliMonthName } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface MonthlySummaryProps {
  transactions: Transaction[];
  categories: Category[];
}

export function MonthlySummary({ transactions, categories }: MonthlySummaryProps) {
  const monthlyData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    
    // Current month transactions
    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Top expense categories
    const categoryExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryExpenses)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, amount]) => {
        const cat = categories.find(c => c.name === name);
        return { name, amount, color: cat?.color || 'hsl(220, 14%, 50%)' };
      });
    
    // Days remaining in month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDate.getDate();
    
    // Monthly budget from expense categories
    const totalBudget = categories.filter(c => c.budget && c.budget > 0).reduce((sum, c) => sum + (c.budget || 0), 0);
    const budgetUsed = totalBudget > 0 ? (expense / totalBudget) * 100 : 0;
    
    // Calculate daily spending allowance:
    // (درآمد ماهانه − هزینه‌ها) ÷ روزهای باقی‌مانده
    // Only show if there's actual income
    const remaining = income - expense;
    const dailyAllowance = daysRemaining > 0 && income > 0 ? Math.max(0, remaining / daysRemaining) : 0;
    
    // Has meaningful data
    const hasData = transactions.length > 0;
    const hasIncome = income > 0;
    const hasExpenses = expense > 0;
    const hasBudget = totalBudget > 0;
    
    return {
      income,
      expense,
      balance: income - expense,
      topCategories,
      daysRemaining,
      totalBudget,
      budgetUsed,
      remaining,
      dailyAllowance,
      transactionCount: monthTransactions.length,
      hasData,
      hasIncome,
      hasExpenses,
      hasBudget,
    };
  }, [transactions, categories]);

  const budgetStatus = monthlyData.budgetUsed > 100 ? 'danger' : monthlyData.budgetUsed > 80 ? 'warning' : 'safe';

  // If no data at all, show empty state
  if (!monthlyData.hasData) {
    return (
      <Card variant="glass" className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            خلاصه {getJalaliMonthName(new Date().toISOString())}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              هنوز تراکنشی ثبت نشده
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              با ثبت اولین تراکنش، خلاصه مالی ماه را ببینید
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          خلاصه {getJalaliMonthName(new Date().toISOString())}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-success/10 border border-success/20">
            <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">درآمد</p>
            <p className="text-sm font-bold text-success">
              {monthlyData.hasIncome ? formatCurrency(monthlyData.income).replace(' تومان', '') : '—'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
            <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">هزینه</p>
            <p className="text-sm font-bold text-destructive">
              {monthlyData.hasExpenses ? formatCurrency(monthlyData.expense).replace(' تومان', '') : '—'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">تراکنش</p>
            <p className="text-sm font-bold text-primary">{monthlyData.transactionCount}</p>
          </div>
        </div>

        {/* Budget Progress - Only show if budget is set */}
        {monthlyData.hasBudget && (
          <div className="p-3 rounded-xl bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">وضعیت بودجه</span>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                budgetStatus === 'danger' && "bg-destructive/20 text-destructive",
                budgetStatus === 'warning' && "bg-warning/20 text-warning-foreground",
                budgetStatus === 'safe' && "bg-success/20 text-success"
              )}>
                {Math.round(monthlyData.budgetUsed)}%
              </span>
            </div>
            <Progress 
              value={Math.min(monthlyData.budgetUsed, 100)} 
              className={cn(
                "h-2",
                budgetStatus === 'danger' && "[&>div]:bg-destructive",
                budgetStatus === 'warning' && "[&>div]:bg-warning"
              )}
            />
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{formatCurrency(monthlyData.expense)} خرج شده</span>
              <span>{formatCurrency(Math.max(0, monthlyData.totalBudget - monthlyData.expense))} باقیمانده</span>
            </div>
          </div>
        )}

        {/* Top Categories */}
        {monthlyData.topCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">بیشترین هزینه‌ها</p>
            {monthlyData.topCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-sm text-foreground truncate">{cat.name}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(cat.amount).replace(' تومان', '')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Daily Allowance - Only show if has income */}
        {monthlyData.daysRemaining > 0 && monthlyData.hasIncome && (
          <div className={cn(
            "flex items-center gap-2 p-2.5 rounded-xl text-xs",
            monthlyData.dailyAllowance <= 0 
              ? "bg-destructive/10 text-destructive" 
              : "bg-primary/10 text-primary"
          )}>
            <Wallet className="w-4 h-4 shrink-0" />
            <span>
              {monthlyData.dailyAllowance > 0 
                ? `روزانه ${formatCurrency(Math.round(monthlyData.dailyAllowance)).replace(' تومان', '')} تومان قابل خرج`
                : 'بودجه ماهانه تمام شده!'
              }
              {' '}({monthlyData.daysRemaining} روز مانده)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
