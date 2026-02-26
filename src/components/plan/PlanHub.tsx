import { Target, PiggyBank, CreditCard, ChartPie, ChevronLeft, Landmark, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Transaction } from '@/types/expense';
import { SavingGoal } from '@/hooks/useSavingGoals';
import { Debt } from '@/hooks/useDebts';
import { formatCurrency, isInCurrentJalaliMonth } from '@/utils/persianDate';
import { Progress } from '@/components/ui/progress';

interface PlanHubProps {
  categories: Category[];
  transactions: Transaction[];
  goals: SavingGoal[];
  debts: Debt[];
  onOpenBudget: () => void;
  onOpenGoals: () => void;
  onOpenDebts: () => void;
}

interface QuickStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick?: () => void;
}

function QuickStat({ icon: Icon, label, value, subtext, color, bgColor, borderColor, onClick }: QuickStatProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden w-full p-4 rounded-2xl bg-card border-2 transition-all duration-300",
        "hover:shadow-md active:scale-[0.98] text-right",
        borderColor
      )}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-50" style={{ background: `hsl(var(--${color.replace('text-', '')}))` }} />
      <div className="relative flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
          bgColor
        )}>
          <Icon className="w-6 h-6 text-foreground" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-black text-foreground truncate">{value}</p>
          {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
        </div>
        <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={2} />
      </div>
    </button>
  );
}

export function PlanHub({
  categories,
  transactions,
  goals,
  debts,
  onOpenBudget,
  onOpenGoals,
  onOpenDebts,
}: PlanHubProps) {
  const budgetStats = (() => {
    const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);
    const totalBudget = budgetedCategories.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpent = budgetedCategories.reduce((sum, c) => sum + (c.spent || 0), 0);
    const usedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overBudgetCount = budgetedCategories.filter(c => (c.spent || 0) > (c.budget || 0)).length;
    return { totalBudget, totalSpent, usedPercent, overBudgetCount, count: budgetedCategories.length };
  })();

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
    return { totalDebt, totalPaid, remaining, progress, overdueCount, count: debts.length };
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-black text-foreground">برنامه‌ریزی مالی</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          بودجه، اهداف و بدهی‌های خود را مدیریت کنید
        </p>
      </div>

      {/* Financial Health - Premium 3D Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/15 shadow-sm">
        <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-primary/8 blur-2xl" />
        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-chart-5/6 blur-xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
              <Target className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">سلامت مالی</h3>
              <p className="text-xs text-muted-foreground">خلاصه وضعیت مالی شما</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-card/80 border border-border/40 shadow-sm">
              <p className="text-xl font-black text-foreground">{budgetStats.count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">بودجه فعال</p>
            </div>
            <div className="p-3 rounded-xl bg-card/80 border border-border/40 shadow-sm">
              <p className="text-xl font-black text-foreground">{goalsStats.count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">هدف پس‌انداز</p>
            </div>
            <div className="p-3 rounded-xl bg-card/80 border border-border/40 shadow-sm">
              <p className="text-xl font-black text-foreground">{debtStats.count}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">بدهی فعال</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground px-1">مدیریت بودجه</h3>
        <QuickStat
          icon={ChartPie}
          label="بودجه ماهانه"
          value={budgetStats.totalBudget > 0 ? `${Math.round(budgetStats.usedPercent)}% استفاده شده` : 'بدون بودجه'}
          subtext={budgetStats.overBudgetCount > 0 ? `${budgetStats.overBudgetCount} دسته بیش از بودجه` : undefined}
          color="chart-1"
          bgColor="bg-gradient-to-br from-chart-1/15 to-chart-1/5 border-chart-1/10"
          borderColor="border-border hover:border-chart-1/30"
          onClick={onOpenBudget}
        />
        {budgetStats.totalBudget > 0 && (
          <div className="px-4">
            <Progress value={Math.min(budgetStats.usedPercent, 100)} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>{formatCurrency(budgetStats.totalSpent)} خرج شده</span>
              <span>{formatCurrency(budgetStats.totalBudget)} کل</span>
            </div>
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground px-1">اهداف پس‌انداز</h3>
        <QuickStat
          icon={PiggyBank}
          label="پیشرفت کلی"
          value={goalsStats.count > 0 ? `${Math.round(goalsStats.progress)}% تکمیل` : 'هدف جدید بسازید'}
          subtext={goalsStats.count > 0 ? `${formatCurrency(goalsStats.totalSaved)} از ${formatCurrency(goalsStats.totalTarget)}` : undefined}
          color="success"
          bgColor="bg-gradient-to-br from-success/15 to-success/5 border-success/10"
          borderColor="border-border hover:border-success/30"
          onClick={onOpenGoals}
        />
        {goalsStats.count > 0 && (
          <div className="px-4">
            <Progress value={goalsStats.progress} className="h-2 [&>div]:bg-success" />
          </div>
        )}
      </div>

      {/* Debts */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground px-1">مدیریت بدهی</h3>
        <QuickStat
          icon={Landmark}
          label="بدهی باقی‌مانده"
          value={debtStats.count > 0 ? formatCurrency(debtStats.remaining) : 'بدون بدهی!'}
          subtext={debtStats.overdueCount > 0 ? `${debtStats.overdueCount} بدهی سررسید شده` : debtStats.count > 0 ? `${Math.round(debtStats.progress)}% پرداخت شده` : undefined}
          color={debtStats.overdueCount > 0 ? "destructive" : "warning"}
          bgColor={cn(
            "border",
            debtStats.overdueCount > 0 
              ? "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/10" 
              : "bg-gradient-to-br from-warning/15 to-warning/5 border-warning/10"
          )}
          borderColor={debtStats.overdueCount > 0 ? "border-destructive/20 hover:border-destructive/40" : "border-border hover:border-warning/30"}
          onClick={onOpenDebts}
        />
        {debtStats.count > 0 && (
          <div className="px-4">
            <Progress value={debtStats.progress} className="h-2 [&>div]:bg-warning" />
          </div>
        )}
      </div>
    </div>
  );
}
