import { useState, useMemo, lazy, Suspense } from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Brain, Sparkles, ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { SavingGoal } from '@/hooks/useSavingGoals';
import { Debt } from '@/hooks/useDebts';
import { SwipeableTransaction } from '@/components/SwipeableTransaction';
import { Input } from '@/components/ui/input';
import { formatCurrency, getJalaliMonthName, toPersianNum } from '@/utils/persianDate';
import { startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, parseISO } from 'date-fns-jalali';
import { cn } from '@/lib/utils';
import { PlanningCard, FinancialHealthCard } from '@/components/reports/PlanningCards';
import { SegmentedControl, FilterPill } from '@/components/ui/segmented-control';

// Lazy load heavy chart components
const AIReport = lazy(() => import('@/components/AIReport').then(m => ({ default: m.AIReport })));
const CategoryBreakdown = lazy(() => import('@/components/reports/CategoryBreakdown').then(m => ({ default: m.CategoryBreakdown })));
const TrendChart = lazy(() => import('@/components/TrendChart').then(m => ({ default: m.TrendChart })));
const MonthlyComparisonChart = lazy(() => import('@/components/MonthlyComparisonChart').then(m => ({ default: m.MonthlyComparisonChart })));

// Loading fallback component
const ChartLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
  </div>
);

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
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Get month boundaries
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Filter transactions by selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, monthStart, monthEnd]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, balance: income - expense };
  }, [monthlyTransactions]);

  // Simple filtered transactions
  const filteredTransactions = useMemo(() => {
    return monthlyTransactions
      .filter((t) => {
        const matchesSearch = 
          !searchQuery ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlyTransactions, searchQuery, typeFilter]);

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

  const goToPrevMonth = () => setSelectedMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setSelectedMonth(prev => addMonths(prev, 1));

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
        <Suspense fallback={<ChartLoader />}>
          <AIReport transactions={transactions} categories={categories} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Month Picker - Enhanced touch targets and visual clarity */}
      <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={goToNextMonth}
            className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="ماه بعد"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2} />
          </button>
          
          <div className="flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-primary" strokeWidth={2} />
            <span className="text-xl font-bold text-foreground tracking-tight">
              {getJalaliMonthName(selectedMonth)}
            </span>
          </div>
          
          <button
            onClick={goToPrevMonth}
            className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="ماه قبل"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Summary Cards - Enhanced visual hierarchy */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border-2 border-success/20 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-success" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">درآمد</p>
          </div>
          <p className="text-2xl font-bold text-success tabular-nums">
            {formatCurrency(monthlySummary.income)}
          </p>
        </div>
        
        <div className="bg-card rounded-2xl border-2 border-destructive/20 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-destructive" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">هزینه</p>
          </div>
          <p className="text-2xl font-bold text-destructive tabular-nums">
            {formatCurrency(monthlySummary.expense)}
          </p>
        </div>
      </div>

      {/* Tab Navigation - Segmented Control */}
      <SegmentedControl<ReportsTab>
        options={tabs}
        value={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        size="md"
      />

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 rounded-xl bg-card border-2 border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Type Filter - Improved pills */}
          <div className="flex gap-2">
            <FilterPill
              label="همه"
              isActive={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <FilterPill
              label="هزینه"
              isActive={typeFilter === 'expense'}
              onClick={() => setTypeFilter('expense')}
              variant="danger"
            />
            <FilterPill
              label="درآمد"
              isActive={typeFilter === 'income'}
              onClick={() => setTypeFilter('income')}
              variant="success"
            />
          </div>

          {/* Transaction Count */}
          <p className="text-xs text-muted-foreground px-1">
            {filteredTransactions.length} تراکنش
          </p>

          {/* Transactions List */}
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
              <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">تراکنشی یافت نشد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Planning Tab - Redesigned with product logic */}
      {activeTab === 'planning' && (
        <div className="space-y-4">
          {/* Financial Health Overview */}
          <FinancialHealthCard
            budgetPercent={planningStats.budget.percent}
            goalsPercent={planningStats.goals.percent}
            debtPercent={planningStats.debts.percent}
            hasData={planningStats.budget.count > 0 || planningStats.goals.count > 0 || planningStats.debts.count > 0}
          />
          
          {/* Section Header */}
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground px-2">برنامه‌ریزی مالی</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          {/* Budget Card */}
          <PlanningCard
            type="budget"
            stats={{
              total: planningStats.budget.total,
              current: planningStats.budget.spent,
              percent: planningStats.budget.percent,
              count: planningStats.budget.count,
              alertCount: planningStats.budget.overBudgetCount,
            }}
            onClick={onOpenBudget}
          />

          {/* Goals Card */}
          <PlanningCard
            type="goals"
            stats={{
              total: planningStats.goals.target,
              current: planningStats.goals.saved,
              percent: planningStats.goals.percent,
              count: planningStats.goals.count,
            }}
            onClick={onOpenGoals}
          />

          {/* Debts Card */}
          <PlanningCard
            type="debts"
            stats={{
              total: debts.reduce((sum, d) => sum + d.totalAmount, 0),
              current: debts.reduce((sum, d) => sum + d.paidAmount, 0),
              percent: planningStats.debts.percent,
              count: planningStats.debts.count,
              alertCount: planningStats.debts.overdueCount,
            }}
            onClick={onOpenDebts}
          />
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* AI Report Card */}
          <button
            onClick={() => setShowAIReport(true)}
            className="w-full relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-card border-2 border-primary/20 text-right active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">تحلیل هوش مصنوعی</h3>
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  گزارش شخصی‌سازی شده با توصیه‌های هوشمند
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-primary mt-2" />
            </div>
          </button>

          {/* Category Breakdown - uses monthly filtered data */}
          <div className="p-4 rounded-2xl bg-card border-2 border-border">
            <h4 className="text-sm font-bold text-foreground mb-4">تفکیک هزینه‌های ماه</h4>
            <Suspense fallback={<ChartLoader />}>
              <CategoryBreakdown transactions={monthlyTransactions} categories={categories} />
            </Suspense>
          </div>

          {/* Trend Chart - uses all transactions for multi-month view */}
          <div className="p-4 rounded-2xl bg-card border-2 border-border">
            <h4 className="text-sm font-bold text-foreground mb-4">روند ۶ ماه اخیر</h4>
            <Suspense fallback={<ChartLoader />}>
              <TrendChart transactions={transactions} />
            </Suspense>
          </div>

          {/* Monthly Comparison */}
          <div className="p-4 rounded-2xl bg-card border-2 border-border">
            <h4 className="text-sm font-bold text-foreground mb-4">مقایسه ماهانه</h4>
            <Suspense fallback={<ChartLoader />}>
              <MonthlyComparisonChart transactions={transactions} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}