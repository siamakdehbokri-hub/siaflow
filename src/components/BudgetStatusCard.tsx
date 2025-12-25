import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Category, Transaction } from '@/types/expense';
import { cn } from '@/lib/utils';

interface BudgetStatusCardProps {
  categories: Category[];
  transactions: Transaction[];
  budgetType?: 'monthly' | 'weekly';
}

export function BudgetStatusCard({
  categories,
  transactions,
  budgetType = 'monthly',
}: BudgetStatusCardProps) {
  const budgetData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel: string;

    if (budgetType === 'weekly') {
      // Calculate current week (Saturday to Friday for Persian calendar)
      const day = now.getDay();
      const diff = day === 6 ? 0 : day + 1; // Adjust for Saturday start
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      periodLabel = 'این هفته';
    } else {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      periodLabel = 'این ماه';
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Calculate days progress
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysProgress = (daysPassed / totalDays) * 100;

    // Calculate budget usage for each category
    return categories
      .filter((c) => c.budget && c.budget > 0)
      .map((category) => {
        const weeklyBudget = budgetType === 'weekly' ? Math.round(category.budget! / 4) : category.budget!;
        
        const spent = transactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.category === category.name &&
              t.date >= startStr &&
              t.date <= endStr
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const percentage = Math.min((spent / weeklyBudget) * 100, 100);
        const remaining = Math.max(weeklyBudget - spent, 0);
        const isOverBudget = spent > weeklyBudget;
        const isNearLimit = percentage >= 80 && !isOverBudget;

        return {
          category,
          budget: weeklyBudget,
          spent,
          remaining,
          percentage,
          isOverBudget,
          isNearLimit,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [categories, transactions, budgetType]);

  const overBudgetCount = budgetData.filter((b) => b.isOverBudget).length;
  const nearLimitCount = budgetData.filter((b) => b.isNearLimit).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const getStatusColor = (percentage: number, isOver: boolean) => {
    if (isOver) return 'bg-destructive';
    if (percentage >= 80) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-primary';
    return 'bg-success';
  };

  const getTextColor = (percentage: number, isOver: boolean) => {
    if (isOver) return 'text-destructive';
    if (percentage >= 80) return 'text-amber-500';
    return 'text-success';
  };

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            وضعیت بودجه {budgetType === 'weekly' ? 'هفتگی' : 'ماهانه'}
          </span>
          {(overBudgetCount > 0 || nearLimitCount > 0) && (
            <div className="flex items-center gap-2">
              {overBudgetCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  {overBudgetCount} عبور از سقف
                </span>
              )}
              {nearLimitCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <Calendar className="w-3 h-3" />
                  {nearLimitCount} نزدیک سقف
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {budgetData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            بودجه‌ای تعریف نشده است
          </p>
        ) : (
          budgetData.slice(0, 5).map(({ category, budget, spent, remaining, percentage, isOverBudget, isNearLimit }) => (
            <div key={category.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{category.name}</span>
                <span className={cn('text-xs', getTextColor(percentage, isOverBudget))}>
                  {isOverBudget ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {formatCurrency(spent - budget)} اضافه
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      {percentage >= 80 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {formatCurrency(remaining)} مانده
                    </span>
                  )}
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getStatusColor(percentage, isOverBudget)
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(spent)} از {formatCurrency(budget)}</span>
                <span>{Math.round(percentage)}%</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
