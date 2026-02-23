import { ChevronLeft, Target, CreditCard, PiggyBank, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
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
        
        <div className="relative overflow-hidden p-5 rounded-2xl text-center glass-card">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/8 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/12 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-primary/15">
              <Target className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">شروع برنامه‌ریزی</h4>
            <p className="text-xs text-muted-foreground mb-4">
              اهداف پس‌انداز، بودجه و بدهی‌های خود را مدیریت کنید
            </p>
            <button
              onClick={onViewGoals}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-all shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
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
            className="relative overflow-hidden w-full p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] text-right glass-card hover:shadow-card-hover"
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-success/8 blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-success/12 backdrop-blur-sm flex items-center justify-center shrink-0 border border-success/15">
                <PiggyBank className="w-5 h-5 text-success" strokeWidth={2} />
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
            className="relative overflow-hidden w-full p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] text-right glass-card hover:shadow-card-hover"
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-chart-1/8 blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-chart-1/12 backdrop-blur-sm flex items-center justify-center shrink-0 border border-chart-1/15">
                <TrendingUp className="w-5 h-5 text-chart-1" strokeWidth={2} />
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
                  <p className="text-[10px] text-destructive mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                    {budgetStats.overBudgetCount} دسته بیش از بودجه
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
              "relative overflow-hidden w-full p-4 rounded-2xl transition-all duration-300 active:scale-[0.98] text-right glass-card hover:shadow-card-hover"
            )}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ background: debtStats.overdueCount > 0 ? 'hsl(var(--destructive) / 0.08)' : 'hsl(var(--warning) / 0.08)' }} />
            <div className="relative z-10 flex items-center gap-3">
              <div className={cn(
                "w-11 h-11 rounded-xl backdrop-blur-sm flex items-center justify-center shrink-0 border",
                debtStats.overdueCount > 0 
                  ? "bg-destructive/12 border-destructive/15" 
                  : "bg-warning/12 border-warning/15"
              )}>
                <CreditCard className={cn("w-5 h-5", debtStats.overdueCount > 0 ? "text-destructive" : "text-warning")} strokeWidth={2} />
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
                  <p className="text-[10px] text-destructive mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                    {debtStats.overdueCount} بدهی سررسید شده
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
