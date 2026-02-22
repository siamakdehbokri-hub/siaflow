import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Clock, Plus, Receipt, PieChart, Landmark, PiggyBank, type LucideIcon } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { isInCurrentJalaliMonth, formatPersianDateFull, isTodayJalali, formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { getTodayLocalISO } from '@/utils/dateUtils';
import { useCurrency } from '@/hooks/useCurrency';

interface HomeScreenProps {
  transactions: Transaction[];
  categories: Category[];
  userName?: string;
  onAddTransaction: (type?: string) => void;
  onViewAllTransactions: () => void;
  onOpenDebts?: () => void;
  showAutoSavings?: boolean;
  onOpenAutoSavings?: () => void;
}

export function HomeScreen({
  transactions,
  categories,
  userName = 'کاربر',
  onAddTransaction,
  onViewAllTransactions,
  onOpenDebts,
  showAutoSavings,
  onOpenAutoSavings,
}: HomeScreenProps) {
  const { formatAmountCompact, currencyInfo } = useCurrency();
  const financialData = useMemo(() => {
    const monthlyTransactions = transactions.filter(t => isInCurrentJalaliMonth(t.date));
    
    const todayExpense = transactions
      .filter(t => t.type === 'expense' && isTodayJalali(t.date))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    return {
      income,
      expense,
      todayExpense,
      balance,
      recentTransactions: [...transactions]
        .sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.id.localeCompare(a.id);
        })
        .slice(0, 3),
    };
  }, [transactions]);

  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome & Date */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-relaxed truncate">
            سلام، {userName} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {persianDate}
          </p>
        </div>
      </div>

      {/* Hero Card - Premium 3D Style */}
      <div className="relative overflow-hidden bg-card rounded-3xl p-6 border-2 border-border shadow-sm">
        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-primary/8 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-chart-3/6 blur-xl" />
        
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
                امروز چقدر خرج کردی؟
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black tabular-nums tracking-tight">
                  {formatAmountCompact(financialData.todayExpense)}
                </span>
                <span className="text-base text-muted-foreground">{currencyInfo.symbol}</span>
              </div>
            </div>
            
            {/* 3D Add button */}
            <button
              onClick={() => onAddTransaction()}
              className="relative w-14 h-14 rounded-2xl bg-primary flex items-center justify-center active:scale-95 transition-all shrink-0 shadow-lg shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="افزودن تراکنش"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              <Plus className="w-7 h-7 text-primary-foreground relative z-10" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Quick actions - 3D icon style */}
          <div className="flex items-center justify-around mt-6 pt-5 border-t-2 border-border/50">
            <QuickActionButton 
              icon={Receipt} 
              label="تراکنش‌ها"
              emoji="📋"
              bgColor="bg-primary"
              onClick={onViewAllTransactions}
            />
            <QuickActionButton 
              icon={PieChart} 
              label="بودجه‌بندی"
              emoji="📊"
              bgColor="bg-success"
              onClick={onViewAllTransactions}
            />
            <QuickActionButton 
              icon={Landmark} 
              label="بدهی‌ها"
              emoji="🏦"
              bgColor="bg-destructive"
              onClick={() => onOpenDebts?.()}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards - 3D Depth */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative overflow-hidden bg-card rounded-2xl p-5 border-2 border-success/20 shadow-sm">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-success/8 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center shrink-0 shadow-sm border border-success/10">
                <span className="text-xl">📈</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">درآمد ماه</p>
            </div>
            <p className="text-xl font-black text-success tabular-nums truncate">
              {formatAmountCompact(financialData.income)}
            </p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-card rounded-2xl p-5 border-2 border-destructive/20 shadow-sm">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-destructive/8 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center shrink-0 shadow-sm border border-destructive/10">
                <span className="text-xl">📉</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">هزینه ماه</p>
            </div>
            <p className="text-xl font-black text-destructive tabular-nums truncate">
              {formatAmountCompact(financialData.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Detail Card */}
      <div className="relative overflow-hidden bg-card rounded-2xl border-2 border-primary/15 shadow-sm">
        <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-primary/6 blur-xl" />
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-chart-4/6 blur-xl" />
        
        <div className="relative p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
              <span className="text-xl">💰</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">مانده دارایی</p>
              <p className="text-xs text-muted-foreground">خلاصه مالی این ماه</p>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="text-center mb-4 py-3 rounded-xl bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">موجودی فعلی</p>
            <p className={cn(
              "text-3xl font-black tabular-nums tracking-tight",
              financialData.balance >= 0 ? "text-success" : "text-destructive"
            )}>
              {financialData.balance >= 0 ? '+' : ''}{formatAmountCompact(financialData.balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{currencyInfo.symbol}</p>
          </div>

          {/* Detail Rows */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-success/5 border border-success/10">
              <div className="flex items-center gap-2">
                <span className="text-sm">📈</span>
                <span className="text-xs font-medium text-muted-foreground">کل درآمد</span>
              </div>
              <span className="text-sm font-bold text-success tabular-nums">{formatAmountCompact(financialData.income)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-destructive/5 border border-destructive/10">
              <div className="flex items-center gap-2">
                <span className="text-sm">📉</span>
                <span className="text-xs font-medium text-muted-foreground">کل هزینه</span>
              </div>
              <span className="text-sm font-bold text-destructive tabular-nums">{formatAmountCompact(financialData.expense)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2">
                <span className="text-sm">💵</span>
                <span className="text-xs font-medium text-muted-foreground">مانده</span>
              </div>
              <span className={cn(
                "text-sm font-bold tabular-nums",
                financialData.balance >= 0 ? "text-primary" : "text-destructive"
              )}>
                {formatAmountCompact(Math.abs(financialData.balance))}
              </span>
            </div>
            {financialData.income > 0 && (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-chart-3/5 border border-chart-3/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📊</span>
                  <span className="text-xs font-medium text-muted-foreground">نرخ پس‌انداز</span>
                </div>
                <span className="text-sm font-bold text-chart-3 tabular-nums">
                  {Math.round(((financialData.income - financialData.expense) / financialData.income) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Savings Banner - Premium */}
      {showAutoSavings && onOpenAutoSavings && (
        <button
          onClick={onOpenAutoSavings}
          className="w-full relative overflow-hidden flex items-center gap-3 bg-primary/5 border-2 border-primary/15 rounded-2xl p-4 active:opacity-80 transition-opacity text-right"
        >
          <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-primary/5 blur-xl" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
            <span className="text-2xl">🐷</span>
          </div>
          <div className="flex-1 min-w-0 relative">
            <p className="text-sm font-bold text-foreground">پس‌انداز کن برای آینده‌ای بهتر!</p>
            <p className="text-xs text-muted-foreground mt-0.5">از مانده ماه قبل پس‌انداز کن 💰</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 relative" strokeWidth={2} />
        </button>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">فعالیت اخیر</h3>
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs font-medium text-primary py-2 px-1 -ml-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            همه
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="bg-card rounded-2xl p-6 border-2 border-border/40 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl opacity-40">📝</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border-2 border-border/40 divide-y divide-border/40 overflow-hidden">
            {financialData.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-4 active:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                    isIncome 
                      ? "bg-gradient-to-br from-success/15 to-success/5 border-success/10" 
                      : "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/10"
                  )}>
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2.5} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {transaction.category}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {transaction.description || '—'}
                    </p>
                  </div>
                  
                  <div className="text-left shrink-0">
                    <p className={cn(
                      "text-sm font-black tabular-nums",
                      isIncome ? "text-success" : "text-destructive"
                    )}>
                      {isIncome ? '+' : '-'}{formatAmountCompact(transaction.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  emoji: string;
  bgColor: string;
  onClick: () => void;
  disabled?: boolean;
}

function QuickActionButton({ icon: Icon, label, emoji, bgColor, onClick, disabled }: QuickActionButtonProps) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-2.5 min-w-0 py-2 px-3 rounded-2xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"
      )}
    >
      <div className={cn(
        "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-md",
        bgColor
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
        <span className="text-2xl relative z-10 drop-shadow-sm">{emoji}</span>
      </div>
      <span className="text-xs font-bold text-foreground truncate max-w-[80px] leading-relaxed">{label}</span>
    </button>
  );
}
