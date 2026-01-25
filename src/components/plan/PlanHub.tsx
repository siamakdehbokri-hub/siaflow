import { useState } from 'react';
import { Target, PiggyBank, CreditCard, ChartPie, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Transaction } from '@/types/expense';
import { SavingGoal } from '@/hooks/useSavingGoals';
import { Debt } from '@/hooks/useDebts';
import { formatCurrency, isInCurrentJalaliMonth } from '@/utils/persianDate';
import { Progress } from '@/components/ui/progress';

type PlanView = 'overview' | 'budget' | 'goals' | 'debts';

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
  icon: typeof Target;
  label: string;
  value: string;
  subtext?: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

function QuickStat({ icon: Icon, label, value, subtext, color, bgColor, onClick }: QuickStatProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right w-full"
    >
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground truncate">{value}</p>
        {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
      </div>
      <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
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
  // Calculate budget stats
  const budgetStats = (() => {
    const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);
    const totalBudget = budgetedCategories.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpent = budgetedCategories.reduce((sum, c) => sum + (c.spent || 0), 0);
    const usedPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overBudgetCount = budgetedCategories.filter(c => (c.spent || 0) > (c.budget || 0)).length;
    
    return { totalBudget, totalSpent, usedPercent, overBudgetCount, count: budgetedCategories.length };
  })();

  // Calculate goals stats
  const goalsStats = (() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    
    return { totalTarget, totalSaved, progress, count: goals.length };
  })();

  // Calculate debt stats
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
        <h2 className="text-xl font-bold text-foreground">برنامه‌ریزی مالی</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          بودجه، اهداف و بدهی‌های خود را مدیریت کنید
        </p>
      </div>

      {/* Overall Financial Health */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">سلامت مالی</h3>
            <p className="text-xs text-muted-foreground">خلاصه وضعیت مالی شما</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-background/50">
            <p className="text-lg font-bold text-foreground">{budgetStats.count}</p>
            <p className="text-[10px] text-muted-foreground">بودجه فعال</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50">
            <p className="text-lg font-bold text-foreground">{goalsStats.count}</p>
            <p className="text-[10px] text-muted-foreground">هدف پس‌انداز</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50">
            <p className="text-lg font-bold text-foreground">{debtStats.count}</p>
            <p className="text-[10px] text-muted-foreground">بدهی فعال</p>
          </div>
        </div>
      </div>

      {/* Budget Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">مدیریت بودجه</h3>
        
        <QuickStat
          icon={ChartPie}
          label="بودجه ماهانه"
          value={budgetStats.totalBudget > 0 ? `${Math.round(budgetStats.usedPercent)}% استفاده شده` : 'بدون بودجه'}
          subtext={budgetStats.overBudgetCount > 0 ? `${budgetStats.overBudgetCount} دسته بیش از بودجه` : undefined}
          color="text-chart-1"
          bgColor="bg-chart-1/10"
          onClick={onOpenBudget}
        />
        
        {budgetStats.totalBudget > 0 && (
          <div className="px-4">
            <Progress value={Math.min(budgetStats.usedPercent, 100)} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>{formatCurrency(budgetStats.totalSpent)} خرج شده</span>
              <span>{formatCurrency(budgetStats.totalBudget)} کل بودجه</span>
            </div>
          </div>
        )}
      </div>

      {/* Goals Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">اهداف پس‌انداز</h3>
        
        <QuickStat
          icon={PiggyBank}
          label="پیشرفت کلی"
          value={goalsStats.count > 0 ? `${Math.round(goalsStats.progress)}% تکمیل` : 'هدف جدید بسازید'}
          subtext={goalsStats.count > 0 ? `${formatCurrency(goalsStats.totalSaved)} از ${formatCurrency(goalsStats.totalTarget)}` : undefined}
          color="text-success"
          bgColor="bg-success/10"
          onClick={onOpenGoals}
        />
        
        {goalsStats.count > 0 && (
          <div className="px-4">
            <Progress value={goalsStats.progress} className="h-2 [&>div]:bg-success" />
          </div>
        )}
      </div>

      {/* Debts Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">مدیریت بدهی</h3>
        
        <QuickStat
          icon={CreditCard}
          label="بدهی باقی‌مانده"
          value={debtStats.count > 0 ? formatCurrency(debtStats.remaining) : 'بدون بدهی!'}
          subtext={debtStats.overdueCount > 0 ? `⚠️ ${debtStats.overdueCount} بدهی سررسید شده` : debtStats.count > 0 ? `${Math.round(debtStats.progress)}% پرداخت شده` : undefined}
          color={debtStats.overdueCount > 0 ? "text-destructive" : "text-warning"}
          bgColor={debtStats.overdueCount > 0 ? "bg-destructive/10" : "bg-warning/10"}
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
