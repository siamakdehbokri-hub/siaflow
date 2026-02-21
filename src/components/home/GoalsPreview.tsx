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
          <h3 className="text-sm font-bold text-foreground">برنامه‌ریزی مالی</h3>
        </div>
        
        <div className="relative overflow-hidden p-5 rounded-2xl bg-card border-2 border-border/40 text-center">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-3 shadow-sm border border-primary/10">
              <span className="text-3xl">🎯</span>
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">شروع برنامه‌ریزی</h4>
            <p className="text-xs text-muted-foreground mb-4">
              اهداف پس‌انداز، بودجه و بدهی‌های خود را مدیریت کنید
            </p>
            <button
              onClick={onViewGoals}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              ایجاد اولین هدف
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-foreground">برنامه‌ریزی مالی</h3>
      </div>
      
      <div className="space-y-2.5">
        {/* Saving Goals */}
        {goalsStats.count > 0 && (
          <button
            onClick={onViewGoals}
            className="relative overflow-hidden w-full p-4 rounded-2xl bg-card border-2 border-border/40 hover:border-success/30 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right"
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-success/6 blur-lg" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-success/15 to-success/5 flex items-center justify-center shrink-0 shadow-sm border border-success/10">
                <span className="text-lg">🐷</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">اهداف پس‌انداز</span>
                  <span className="text-xs font-black text-success">{Math.round(goalsStats.progress)}%</span>
                </div>
                <Progress value={goalsStats.progress} className="h-1.5 [&>div]:bg-success" />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {formatCurrency(goalsStats.totalSaved)} از {formatCurrency(goalsStats.totalTarget)}
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} />
            </div>
          </button>
        )}

        {/* Budget */}
        {budgetStats.count > 0 && (
          <button
            onClick={onViewBudget}
            className="relative overflow-hidden w-full p-4 rounded-2xl bg-card border-2 border-border/40 hover:border-chart-1/30 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right"
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-chart-1/6 blur-lg" />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chart-1/15 to-chart-1/5 flex items-center justify-center shrink-0 shadow-sm border border-chart-1/10">
                <span className="text-lg">📊</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">بودجه ماهانه</span>
                  <span className={cn(
                    "text-xs font-black",
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
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} />
            </div>
          </button>
        )}

        {/* Debts */}
        {debtStats.count > 0 && (
          <button
            onClick={onViewDebts}
            className={cn(
              "relative overflow-hidden w-full p-4 rounded-2xl bg-card border-2 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right",
              debtStats.overdueCount > 0 
                ? "border-destructive/30 hover:border-destructive/50" 
                : "border-border/40 hover:border-warning/30"
            )}
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full blur-lg" style={{ background: debtStats.overdueCount > 0 ? 'hsl(var(--destructive) / 0.06)' : 'hsl(var(--warning) / 0.06)' }} />
            <div className="relative flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                debtStats.overdueCount > 0 
                  ? "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/10" 
                  : "bg-gradient-to-br from-warning/15 to-warning/5 border-warning/10"
              )}>
                <span className="text-lg">🏦</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">بدهی‌ها</span>
                  <span className={cn(
                    "text-xs font-black",
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
              <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
