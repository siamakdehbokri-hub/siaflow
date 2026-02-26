import { useState, useMemo, lazy, Suspense } from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Brain, Sparkles, ChevronLeft, ChevronRight, CalendarDays, Loader2, PieChart, TrendingUp, BarChart3 } from 'lucide-react';
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
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'saving'>('all');
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
    
    const saving = monthlyTransactions
      .filter(t => t.type === 'saving')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, saving, balance: income - expense - saving };
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
      {/* Month Picker */}
      <div className="rounded-2xl p-4"
        style={{
          background: 'hsl(var(--card) / 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid hsl(var(--border) / 0.4)',
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={goToNextMonth}
            className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: 'hsl(var(--muted) / 0.5)' }}
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
            className="w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: 'hsl(var(--muted) / 0.5)' }}
            aria-label="ماه قبل"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'hsl(var(--card) / 0.6)',
            border: '1px solid hsl(var(--success) / 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'hsl(var(--success) / 0.12)', border: '1px solid hsl(var(--success) / 0.2)' }}
              >
                <ArrowUpRight className="w-6 h-6 text-success" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">درآمد</p>
            </div>
            <p className="text-2xl font-black text-success tabular-nums">
              {formatCurrency(monthlySummary.income)}
            </p>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background: 'hsl(var(--card) / 0.6)',
            border: '1px solid hsl(var(--destructive) / 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'hsl(var(--destructive) / 0.12)', border: '1px solid hsl(var(--destructive) / 0.2)' }}
              >
                <ArrowDownRight className="w-6 h-6 text-destructive" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">هزینه</p>
            </div>
            <p className="text-2xl font-black text-destructive tabular-nums">
              {formatCurrency(monthlySummary.expense)}
            </p>
          </div>
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
              className="pr-12 h-12 rounded-xl border-border/40"
              style={{ background: 'hsl(var(--card) / 0.6)', borderWidth: '1px' }}
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
            <FilterPill
              label="پس‌انداز"
              isActive={typeFilter === 'saving'}
              onClick={() => setTypeFilter('saving')}
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
              <div className="text-center py-12 rounded-xl" style={{ background: 'hsl(var(--card) / 0.5)', border: '1px solid hsl(var(--border) / 0.4)' }}>
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
        <div className="space-y-5 animate-fade-in">
          
          {/* AI Report - Premium Hero Card */}
          <button
            onClick={() => setShowAIReport(true)}
            className="w-full relative overflow-hidden rounded-3xl text-right active:scale-[0.98] transition-all duration-300 group"
          >
            {/* Multi-layer gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-white/10 rounded-3xl" />
            
            {/* Decorative 3D orbs */}
            <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/8 blur-xl" />
            <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white/5 blur-lg" />
            
            <div className="relative p-6">
              <div className="flex items-start gap-4">
                {/* 3D Icon Container */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 border border-white/20">
                    <Brain className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.8} />
                  </div>
                  {/* Floating sparkle */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning/90 flex items-center justify-center shadow-md animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white mb-1 drop-shadow-sm">
                    تحلیل هوش مصنوعی
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    بررسی دقیق تک‌تک تراکنش‌ها و توصیه‌های شخصی‌سازی شده
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      تحلیل عمیق
                    </span>
                    <span className="text-[11px] font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      پیشنهاد بودجه
                    </span>
                  </div>
                </div>
                
                <ChevronLeft className="w-6 h-6 text-white/70 mt-2 shrink-0 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
              </div>
            </div>
          </button>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative overflow-hidden p-4 rounded-2xl" style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border) / 0.4)' }}>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-success/8 blur-lg" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-2 shadow-sm">
                  <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] text-muted-foreground mb-0.5">درآمد ماه</p>
                <p className="text-sm font-black text-success tabular-nums">
                  {formatCurrency(monthlySummary.income).replace(' تومان', '')}
                </p>
              </div>
            </div>
            
            <div className="relative overflow-hidden p-4 rounded-2xl" style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border) / 0.4)' }}>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-destructive/8 blur-lg" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-2 shadow-sm">
                  <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] text-muted-foreground mb-0.5">هزینه ماه</p>
                <p className="text-sm font-black text-destructive tabular-nums">
                  {formatCurrency(monthlySummary.expense).replace(' تومان', '')}
                </p>
              </div>
            </div>
            
            <div className="relative overflow-hidden p-4 rounded-2xl" style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border) / 0.4)' }}>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-primary/8 blur-lg" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 shadow-sm">
                  <CalendarDays className="w-5 h-5 text-primary" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] text-muted-foreground mb-0.5">تراکنش</p>
                <p className="text-sm font-black text-foreground tabular-nums">
                  {toPersianNum(monthlyTransactions.length)}
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown - Premium Card */}
          <div className="relative overflow-hidden rounded-3xl" style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border) / 0.4)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/5 flex items-center justify-center shadow-sm border border-chart-3/10">
                  <PieChart className="w-6 h-6 text-chart-3" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">تفکیک هزینه‌های ماه</h4>
                  <p className="text-[11px] text-muted-foreground">سهم هر دسته از کل هزینه‌ها</p>
                </div>
              </div>
              <Suspense fallback={<ChartLoader />}>
                <CategoryBreakdown transactions={monthlyTransactions} categories={categories} />
              </Suspense>
            </div>
          </div>

          {/* Trend Chart - Premium Card */}
          <div className="relative overflow-hidden rounded-3xl" style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border) / 0.4)' }}>
            <div className="absolute top-0 left-0 w-28 h-28 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">روند ۶ ماه اخیر</h4>
                  <p className="text-[11px] text-muted-foreground">تغییرات درآمد و هزینه در طول زمان</p>
                </div>
              </div>
              <Suspense fallback={<ChartLoader />}>
                <TrendChart transactions={transactions} />
              </Suspense>
            </div>
          </div>

          {/* Monthly Comparison - Premium Card */}
          <div className="relative overflow-hidden rounded-3xl" style={{ background: 'hsl(var(--card) / 0.6)', border: '1px solid hsl(var(--border) / 0.4)' }}>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-chart-5/5 rounded-full blur-2xl translate-y-1/3" />
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chart-5/20 to-chart-5/5 flex items-center justify-center shadow-sm border border-chart-5/10">
                  <BarChart3 className="w-6 h-6 text-chart-5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">مقایسه ماهانه</h4>
                  <p className="text-[11px] text-muted-foreground">مقایسه عملکرد ماه‌ها با یکدیگر</p>
                </div>
              </div>
              <Suspense fallback={<ChartLoader />}>
                <MonthlyComparisonChart transactions={transactions} />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}