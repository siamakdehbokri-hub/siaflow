import { useState, useMemo } from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Brain, TrendingUp, PiggyBank, CreditCard, ChartPie, Sparkles, ChevronLeft } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { SavingGoal } from '@/hooks/useSavingGoals';
import { Debt } from '@/hooks/useDebts';
import { SwipeableTransaction } from '@/components/SwipeableTransaction';
import { AIReport } from '@/components/AIReport';
import { SpendingChart } from '@/components/SpendingChart';
import { TrendChart } from '@/components/TrendChart';
import { MonthlyComparisonChart } from '@/components/MonthlyComparisonChart';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, isInCurrentJalaliMonth } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

type ReportsTab = 'transactions' | 'planning' | 'insights';

interface ReportsHubProps {
  transactions: Transaction[];
  categories: Category[];
  goals: SavingGoal[];
  debts: Debt[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenGoals: () => void;
  onOpenDebts: () => void;
  onOpenBudget: () => void;
}

export function ReportsHub({
  transactions,
  categories,
  goals,
  debts,
  onEditTransaction,
  onDeleteTransaction,
  onOpenGoals,
  onOpenDebts,
  onOpenBudget,
}: ReportsHubProps) {
  const [activeTab, setActiveTab] = useState<ReportsTab>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showAIReport, setShowAIReport] = useState(false);

  // Simple filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch = 
          !searchQuery ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, typeFilter]);

  // Planning stats
  const planningStats = useMemo(() => {
    // Budget
    const budgetedCategories = categories.filter(c => c.budget && c.budget > 0);
    const totalBudget = budgetedCategories.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalSpent = budgetedCategories.reduce((sum, c) => sum + (c.spent || 0), 0);
    const budgetPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overBudgetCount = budgetedCategories.filter(c => (c.spent || 0) > (c.budget || 0)).length;

    // Goals
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const goalsPercent = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    // Debts
    const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const debtRemaining = totalDebt - totalPaid;
    const debtPercent = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
    const overdueCount = debts.filter(d => {
      if (!d.dueDate) return false;
      return new Date(d.dueDate) < new Date() && d.paidAmount < d.totalAmount;
    }).length;

    return {
      budget: { total: totalBudget, spent: totalSpent, percent: budgetPercent, overBudgetCount, count: budgetedCategories.length },
      goals: { target: totalTarget, saved: totalSaved, percent: goalsPercent, count: goals.length },
      debts: { remaining: debtRemaining, percent: debtPercent, overdueCount, count: debts.length },
    };
  }, [categories, goals, debts]);

  const tabs = [
    { id: 'transactions' as const, label: 'تراکنش‌ها' },
    { id: 'planning' as const, label: 'برنامه‌ریزی' },
    { id: 'insights' as const, label: 'تحلیل' },
  ];

  // AI Report View
  if (showAIReport) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => setShowAIReport(false)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          بازگشت
        </button>
        <AIReport transactions={transactions} categories={categories} />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Simple Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-12 rounded-xl bg-card border-border/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
            {(['all', 'expense', 'income'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  typeFilter === type
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === 'all' ? 'همه' : type === 'expense' ? 'هزینه' : 'درآمد'}
              </button>
            ))}
          </div>

          {/* Transaction Count */}
          <p className="text-xs text-muted-foreground px-1">
            {filteredTransactions.length} تراکنش
          </p>

          {/* Transactions List - Simple, no date grouping */}
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <SwipeableTransaction
                key={transaction.id}
                transaction={transaction}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
              />
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">تراکنشی یافت نشد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Planning Tab */}
      {activeTab === 'planning' && (
        <div className="space-y-4">
          {/* Budget Card */}
          <button
            onClick={onOpenBudget}
            className="w-full p-4 rounded-2xl bg-card border border-border/30 hover:border-border/50 transition-all text-right"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-chart-1/10 flex items-center justify-center">
                <ChartPie className="w-5 h-5 text-chart-1" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">بودجه ماهانه</p>
                <p className="text-xs text-muted-foreground">
                  {planningStats.budget.count > 0 
                    ? `${Math.round(planningStats.budget.percent)}% استفاده شده`
                    : 'بودجه تعیین کنید'
                  }
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </div>
            {planningStats.budget.total > 0 && (
              <>
                <Progress value={Math.min(planningStats.budget.percent, 100)} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>{formatCurrency(planningStats.budget.spent)}</span>
                  <span>{formatCurrency(planningStats.budget.total)}</span>
                </div>
              </>
            )}
            {planningStats.budget.overBudgetCount > 0 && (
              <p className="text-xs text-destructive mt-2">
                ⚠️ {planningStats.budget.overBudgetCount} دسته بیش از بودجه
              </p>
            )}
          </button>

          {/* Goals Card */}
          <button
            onClick={onOpenGoals}
            className="w-full p-4 rounded-2xl bg-card border border-border/30 hover:border-border/50 transition-all text-right"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">اهداف پس‌انداز</p>
                <p className="text-xs text-muted-foreground">
                  {planningStats.goals.count > 0 
                    ? `${Math.round(planningStats.goals.percent)}% تکمیل`
                    : 'هدف جدید بسازید'
                  }
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </div>
            {planningStats.goals.count > 0 && (
              <>
                <Progress value={planningStats.goals.percent} className="h-2 [&>div]:bg-success" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>{formatCurrency(planningStats.goals.saved)}</span>
                  <span>{formatCurrency(planningStats.goals.target)}</span>
                </div>
              </>
            )}
          </button>

          {/* Debts Card */}
          <button
            onClick={onOpenDebts}
            className="w-full p-4 rounded-2xl bg-card border border-border/30 hover:border-border/50 transition-all text-right"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center",
                planningStats.debts.overdueCount > 0 ? "bg-destructive/10" : "bg-warning/10"
              )}>
                <CreditCard className={cn(
                  "w-5 h-5",
                  planningStats.debts.overdueCount > 0 ? "text-destructive" : "text-warning"
                )} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">مدیریت بدهی</p>
                <p className="text-xs text-muted-foreground">
                  {planningStats.debts.count > 0 
                    ? formatCurrency(planningStats.debts.remaining) + ' باقی‌مانده'
                    : 'بدون بدهی!'
                  }
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </div>
            {planningStats.debts.count > 0 && (
              <Progress value={planningStats.debts.percent} className="h-2 [&>div]:bg-warning" />
            )}
            {planningStats.debts.overdueCount > 0 && (
              <p className="text-xs text-destructive mt-2">
                ⚠️ {planningStats.debts.overdueCount} بدهی سررسید شده
              </p>
            )}
          </button>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* AI Report Card */}
          <button
            onClick={() => setShowAIReport(true)}
            className="w-full relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-card border border-primary/20 text-right"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-foreground">تحلیل هوش مصنوعی</h3>
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  گزارش شخصی‌سازی شده با توصیه‌های هوشمند
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-primary shrink-0 mt-2" />
            </div>
          </button>

          {/* Charts */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">تفکیک هزینه‌ها</h4>
              <SpendingChart categories={categories} />
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">روند هزینه‌ها</h4>
              <TrendChart transactions={transactions} />
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">مقایسه ماهانه</h4>
              <MonthlyComparisonChart transactions={transactions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
