import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Receipt, PieChart, Landmark, TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3, Layers, type LucideIcon } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { isTodayJalali, formatPersianDateFull, formatPersianDateShort } from '@/utils/persianDate';
import { getCurrentMonthSummary } from '@/utils/financialEngine';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface HomeScreenProps {
  transactions: Transaction[];
  categories: Category[];
  userName?: string;
  onAddTransaction: (type?: string) => void;
  onViewAllTransactions: () => void;
  onOpenDebts?: () => void;
  onOpenBudget?: () => void;
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
  onOpenBudget,
  showAutoSavings,
  onOpenAutoSavings,
}: HomeScreenProps) {
  const { formatAmountCompact, currencyInfo, convertAmount, currency } = useCurrency();

  // Format number without currency symbol
  const formatNumberFull = (amount: number) => {
    const converted = convertAmount(amount);
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(converted);
    }
    return new Intl.NumberFormat('fa-IR').format(Math.round(converted));
  };

  // Format compact without currency symbol
  const formatCompactOnly = (amount: number) => {
    const converted = convertAmount(amount);
    if (currency === 'USD') {
      if (converted >= 1000000) return (converted / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (converted >= 1000) return (converted / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      return converted.toFixed(0);
    }
    const rounded = Math.round(converted);
    if (rounded >= 1000000000) {
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(rounded / 1000000000) + ' میلیارد';
    }
    if (rounded >= 1000000) {
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(rounded / 1000000) + ' میلیون';
    }
    if (rounded >= 1000) {
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(rounded / 1000) + ' هزار';
    }
    return new Intl.NumberFormat('fa-IR').format(rounded);
  };

  const financialData = useMemo(() => {
    const summary = getCurrentMonthSummary(transactions, categories);
    
    const todayExpense = transactions
      .filter(t => t.type === 'expense' && isTodayJalali(t.date))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income: summary.totalIncome,
      expense: summary.totalExpense,
      saving: summary.totalSaving,
      todayExpense,
      balance: summary.netBalance,
      savingsRate: summary.savingsRate,
      expenseToIncomeRatio: summary.expenseToIncomeRatio,
      recentTransactions: [...transactions]
        .sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.id.localeCompare(a.id);
        })
        .slice(0, 4),
    };
  }, [transactions, categories]);

  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());
  const hasNoData = transactions.length === 0;

  return (
    <div className="relative space-y-5 animate-fade-in">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--blob-purple)' }} />
      <div className="pointer-events-none absolute top-96 -left-20 w-60 h-60 rounded-full blur-3xl" style={{ background: 'var(--blob-teal)' }} />
      
      {/* Welcome & Date */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-relaxed truncate">
            سلام، {userName}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            {persianDate}
          </p>
        </div>
      </div>

      {/* Hero Card - Glass Heavy */}
      <div className="relative glass-heavy rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
              {hasNoData ? 'خوش آمدید!' : 'امروز چقدر خرج کردی؟'}
            </p>
            {hasNoData ? (
              <p className="text-base font-bold text-foreground leading-relaxed">
                اولین تراکنش خود را ثبت کنید
              </p>
            ) : (
              <span className={cn(
                "text-3xl font-black tabular-nums tracking-tight",
                financialData.todayExpense > 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {formatCompactOnly(financialData.todayExpense)} {currencyInfo.symbol}
              </span>
            )}
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center justify-around mt-6 pt-5 border-t border-border">
          <QuickActionButton 
            icon={Layers} 
            label="تراکنش‌ها"
            color="primary"
            onClick={onViewAllTransactions}
            ariaLabel="مشاهده تراکنش‌ها"
          />
          <QuickActionButton 
            icon={BarChart3} 
            label="بودجه‌بندی"
            color="success"
            onClick={() => onOpenBudget?.()}
            ariaLabel="مشاهده بودجه‌بندی"
          />
          <QuickActionButton 
            icon={Landmark} 
            label="بدهی‌ها"
            color="warning"
            onClick={() => onOpenDebts?.()}
            ariaLabel="مدیریت بدهی‌ها"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {!hasNoData && (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={ArrowDownRight}
            label="هزینه ماه"
            value={formatCompactOnly(financialData.expense)}
            currencyLabel={currencyInfo.symbol}
            type="expense"
          />
          <SummaryCard
            icon={ArrowUpRight}
            label="درآمد ماه"
            value={formatCompactOnly(financialData.income)}
            currencyLabel={currencyInfo.symbol}
            type="income"
          />
        </div>
      )}

      {/* Balance Detail Card - Only show when there's data */}
      {!hasNoData && (
        <div className="relative glass-heavy rounded-2xl">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-success/10">
                <Wallet className="w-5 h-5 text-success" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">خلاصه مالی</p>
                <p className="text-xs text-muted-foreground">وضعیت این ماه</p>
              </div>
            </div>

            {/* Balance Amount */}
            <div className="text-center mb-4 py-3.5 rounded-2xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">مانده خالص</p>
              <p className={cn(
                "text-3xl font-black tabular-nums tracking-tight",
                financialData.balance >= 0 ? "text-success" : "text-destructive"
              )}>
                {financialData.balance >= 0 ? '+' : ''}{formatCompactOnly(financialData.balance)} {currencyInfo.symbol}
              </p>
            </div>

            {/* Detail Rows - only non-duplicate info */}
            <div className="space-y-2">
              {financialData.saving > 0 && (
                <DetailRow
                  icon={<PiggyBank className="w-4 h-4 text-primary" strokeWidth={2} />}
                  iconBg="bg-primary/10"
                  label="پس‌انداز"
                  value={formatCompactOnly(financialData.saving) + ' ' + currencyInfo.symbol}
                  valueClassName="text-primary"
                />
              )}
              {financialData.income > 0 && (
                <DetailRow
                  icon={<BarChart3 className="w-4 h-4 text-warning" strokeWidth={2} />}
                  iconBg="bg-warning/10"
                  label="نرخ پس‌انداز"
                  value={`٪${financialData.savingsRate}`}
                  valueClassName={financialData.savingsRate >= 20 ? "text-success" : financialData.savingsRate >= 10 ? "text-warning" : "text-muted-foreground"}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Savings Banner */}
      {showAutoSavings && onOpenAutoSavings && (
        <button
          onClick={onOpenAutoSavings}
          className="w-full flex items-center gap-3 glass-card rounded-2xl p-4 active:opacity-80 transition-opacity text-right border-primary/20"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary/15">
            <PiggyBank className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">پس‌انداز کن برای آینده‌ای بهتر!</p>
            <p className="text-xs text-muted-foreground mt-0.5">از مانده ماه قبل پس‌انداز کن</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={2} />
        </button>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">فعالیت اخیر</h3>
          {financialData.recentTransactions.length > 0 && (
            <button 
              onClick={onViewAllTransactions}
              className="flex items-center gap-1 text-xs font-medium py-2.5 px-3 -ml-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-primary active:bg-primary/10 transition-colors"
            >
              همه
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-primary/10">
              <Receipt className="w-8 h-8 text-primary/50" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">هنوز تراکنشی ثبت نشده</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              با دکمه <span className="text-primary font-bold">+</span> اولین تراکنش خود را اضافه کنید
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            {financialData.recentTransactions.map((transaction, idx) => {
              const isIncome = transaction.type === 'income';
              const prevDate = idx > 0 ? formatPersianDateShort(financialData.recentTransactions[idx - 1].date) : null;
              const currentDate = formatPersianDateShort(transaction.date);
              const showDateHeader = idx === 0 || currentDate !== prevDate;
              
              return (
                <div key={transaction.id}>
                  {showDateHeader && (
                    <div className={cn(
                      "px-4 py-2 text-[11px] font-bold text-muted-foreground bg-muted/40",
                      idx > 0 && "border-t border-border"
                    )}>
                      {currentDate}
                    </div>
                  )}
                  <div 
                    className={cn(
                      "flex items-center gap-3 p-4 active:bg-accent/30 transition-colors",
                      !showDateHeader && idx > 0 && "border-t border-border/50"
                    )}
                  >
                    <div className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                      isIncome ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2} />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2} />
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
                        {isIncome ? '+' : '-'}{formatNumberFull(transaction.amount)}
                      </p>
                    </div>
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

// --- Sub-components ---

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  currencyLabel: string;
  type: 'income' | 'expense';
}

function SummaryCard({ icon: Icon, label, value, currencyLabel, type }: SummaryCardProps) {
  const isIncome = type === 'income';
  
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          isIncome ? "bg-success" : "bg-destructive"
        )}>
          <Icon className={cn("w-4.5 h-4.5", isIncome ? "text-success-foreground" : "text-destructive-foreground")} strokeWidth={2} />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={cn(
        "text-base font-black tabular-nums leading-snug break-words",
        isIncome ? "text-success" : "text-destructive"
      )} dir="ltr">
        {value} {currencyLabel}
      </p>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueClassName: string;
}

function DetailRow({ icon, iconBg, label, value, valueClassName }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/50 border border-border">
      <div className="flex items-center gap-2">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-sm font-bold tabular-nums", valueClassName)}>{value}</span>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: 'primary' | 'success' | 'destructive' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function QuickActionButton({ icon: Icon, label, color, onClick, disabled, ariaLabel }: QuickActionButtonProps) {
  const colorClass = {
    primary: 'text-primary',
    success: 'text-success',
    destructive: 'text-destructive',
    warning: 'text-warning',
  }[color];

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={cn(
        "flex flex-col items-center gap-2.5 min-w-0 py-2.5 px-4 rounded-2xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:bg-accent/40 active:scale-95",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      <Icon className={cn("w-7 h-7", colorClass)} strokeWidth={2} />
      <span className="text-xs font-bold truncate max-w-[80px] leading-relaxed text-muted-foreground">{label}</span>
    </button>
  );
}
