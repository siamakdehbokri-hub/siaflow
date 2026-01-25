import { PiggyBank, ChevronLeft, Target, CreditCard, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SavingGoal } from '@/hooks/useSavingGoals';
import { Debt } from '@/hooks/useDebts';
import { formatCurrency } from '@/utils/persianDate';
import { Progress } from '@/components/ui/progress';
import { Category } from '@/types/expense';

interface GoalsPreviewProps {
  goals: SavingGoal[];
  debts: Debt[];
  categories: Category[];
  onViewGoals: () => void;
  onViewDebts: () => void;
  onViewBudget: () => void;
}

export function GoalsPreview({
  goals,
  debts,
  categories,
  onViewGoals,
  onViewDebts,
  onViewBudget,
}: GoalsPreviewProps) {
  // Calculate stats
  const goalsStats = (() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return { totalTarget, totalSaved, progress, count: goals.length };
  })();

  const debtStats = (() => {
    const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const remaining = totalDebt - totalPaid;
    const progress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
    const overdueCount = debts.filter(d => {
      if (!d.dueDate) return false;
      return new Date(d.dueDate) < new Date() && d.paidAmount < d.totalAmount;
    }).length;
    return { remaining, progress, overdueCount, count: debts.length };
  })();

  const budgetStats = (() => {
    const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);
    const totalBudget = budgetedCategories.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpent = budgetedCategories.reduce((sum, c) => sum + (c.spent || 0), 0);
    const usedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overBudgetCount = budgetedCategories.filter(c => (c.spent || 0) > (c.budget || 0)).length;
    return { totalBudget, totalSpent, usedPercent, overBudgetCount, count: budgetedCategories.length };
  })();

  const hasNoData = goalsStats.count === 0 && debtStats.count === 0 && budgetStats.count === 0;

  if (hasNoData) {
    return (
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-semibold text-foreground">برنامه‌ریزی مالی</h3>
        </div>
        
        <div className="p-5 rounded-2xl bg-card border border-border/30 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h4 className="text-sm font-medium text-foreground mb-1">شروع برنامه‌ریزی</h4>
          <p className="text-xs text-muted-foreground mb-4">
            اهداف پس‌انداز، بودجه و بدهی‌های خود را مدیریت کنید
          </p>
          <button
            onClick={onViewGoals}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            ایجاد اولین هدف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-foreground">برنامه‌ریزی مالی</h3>
      </div>
      
      <div className="space-y-2.5">
        {/* Saving Goals */}
        {goalsStats.count > 0 && (
          <button
            onClick={onViewGoals}
            className="w-full p-4 rounded-2xl bg-card border border-border/30 hover:border-success/30 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">اهداف پس‌انداز</span>
                  <span className="text-xs font-medium text-success">{Math.round(goalsStats.progress)}%</span>
                </div>
                <Progress value={goalsStats.progress} className="h-1.5 [&>div]:bg-success" />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {formatCurrency(goalsStats.totalSaved)} از {formatCurrency(goalsStats.totalTarget)}
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        )}

        {/* Budget Status */}
        {budgetStats.count > 0 && (
          <button
            onClick={onViewBudget}
            className="w-full p-4 rounded-2xl bg-card border border-border/30 hover:border-chart-1/30 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-chart-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">بودجه ماهانه</span>
                  <span className={cn(
                    "text-xs font-medium",
                    budgetStats.usedPercent > 90 ? "text-destructive" : "text-chart-1"
                  )}>
                    {Math.round(budgetStats.usedPercent)}% مصرف
                  </span>
                </div>
                <Progress 
                  value={Math.min(budgetStats.usedPercent, 100)} 
                  className={cn("h-1.5", budgetStats.usedPercent > 100 && "[&>div]:bg-destructive")} 
                />
                {budgetStats.overBudgetCount > 0 && (
                  <p className="text-[10px] text-destructive mt-1.5">
                    ⚠️ {budgetStats.overBudgetCount} دسته بیش از بودجه
                  </p>
                )}
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        )}

        {/* Debt Status */}
        {debtStats.count > 0 && (
          <button
            onClick={onViewDebts}
            className={cn(
              "w-full p-4 rounded-2xl bg-card border transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right",
              debtStats.overdueCount > 0 
                ? "border-destructive/30 hover:border-destructive/50" 
                : "border-border/30 hover:border-warning/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                debtStats.overdueCount > 0 ? "bg-destructive/10" : "bg-warning/10"
              )}>
                <CreditCard className={cn(
                  "w-5 h-5",
                  debtStats.overdueCount > 0 ? "text-destructive" : "text-warning"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">بدهی‌ها</span>
                  <span className={cn(
                    "text-xs font-medium",
                    debtStats.overdueCount > 0 ? "text-destructive" : "text-warning"
                  )}>
                    {formatCurrency(debtStats.remaining)}
                  </span>
                </div>
                <Progress 
                  value={debtStats.progress} 
                  className={cn("h-1.5", debtStats.overdueCount > 0 ? "[&>div]:bg-destructive" : "[&>div]:bg-warning")} 
                />
                {debtStats.overdueCount > 0 && (
                  <p className="text-[10px] text-destructive mt-1.5">
                    ⚠️ {debtStats.overdueCount} بدهی سررسید شده
                  </p>
                )}
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
