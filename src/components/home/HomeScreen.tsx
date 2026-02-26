import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Plus, Receipt, PieChart, Landmark, TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3, type LucideIcon } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { isTodayJalali, formatPersianDateFull } from '@/utils/persianDate';
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
    // Use the centralized financial engine for ALL calculations
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
        .slice(0, 3),
    };
  }, [transactions, categories]);

  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());

  return (
    <div className="space-y-5 animate-fade-in">
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
        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)' }} />
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
              امروز چقدر خرج کردی؟
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base text-muted-foreground">{currencyInfo.symbol}</span>
              <span className="text-4xl font-black tabular-nums tracking-tight text-success">
                {formatAmountCompact(financialData.todayExpense)}
              </span>
            </div>
          </div>
          
          {/* Add button - solid circle */}
          <button
            onClick={() => onAddTransaction()}
            className="flex items-center justify-center active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[52px] h-[52px] rounded-full bg-primary text-primary-foreground"
            aria-label="افزودن تراکنش"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Quick actions - no background boxes */}
        <div className="flex items-center justify-around mt-6 pt-5 border-t border-border">
          <QuickActionButton 
            icon={Receipt} 
            label="تراکنش‌ها"
            color="primary"
            onClick={onViewAllTransactions}
            ariaLabel="مشاهده تراکنش‌ها"
          />
          <QuickActionButton 
            icon={PieChart} 
            label="بودجه‌بندی"
            color="success"
            onClick={onViewAllTransactions}
            ariaLabel="مشاهده بودجه‌بندی"
          />
          <QuickActionButton 
            icon={Landmark} 
            label="بدهی‌ها"
            color="destructive"
            onClick={() => onOpenDebts?.()}
            ariaLabel="مدیریت بدهی‌ها"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={ArrowDownRight}
          label="هزینه ماه"
          value={formatAmountCompact(financialData.expense)}
          type="expense"
        />
        <SummaryCard
          icon={ArrowUpRight}
          label="درآمد ماه"
          value={formatAmountCompact(financialData.income)}
          type="income"
        />
      </div>

      {/* Balance Detail Card - Glass Heavy */}
      <div className="relative glass-heavy rounded-2xl">
        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl overflow-hidden" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.24), transparent)' }} />
        
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">مانده دارایی</p>
              <p className="text-xs text-muted-foreground">خلاصه مالی این ماه</p>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="text-center mb-4 py-3.5 rounded-2xl bg-muted/50 border border-border">
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
          <div className="space-y-2">
            <DetailRow
              icon={<ArrowUpRight className="w-4 h-4 text-success" strokeWidth={2} />}
              iconBg="bg-success/10"
              label="کل درآمد"
              value={formatAmountCompact(financialData.income)}
              valueClassName="text-success"
            />
            <DetailRow
              icon={<ArrowDownRight className="w-4 h-4 text-destructive" strokeWidth={2} />}
              iconBg="bg-destructive/10"
              label="کل هزینه"
              value={formatAmountCompact(financialData.expense)}
              valueClassName="text-destructive"
            />
            {financialData.saving > 0 && (
              <DetailRow
                icon={<PiggyBank className="w-4 h-4 text-primary" strokeWidth={2} />}
                iconBg="bg-primary/10"
                label="پس‌انداز"
                value={formatAmountCompact(financialData.saving)}
                valueClassName="text-primary"
              />
            )}
            <DetailRow
              icon={<Wallet className="w-4 h-4 text-success" strokeWidth={2} />}
              iconBg="bg-success/10"
              label="مانده خالص"
              value={formatAmountCompact(Math.abs(financialData.balance))}
              valueClassName={financialData.balance >= 0 ? "text-success" : "text-destructive"}
            />
            {financialData.income > 0 && (
              <DetailRow
                icon={<BarChart3 className="w-4 h-4 text-warning" strokeWidth={2} />}
                iconBg="bg-warning/10"
                label="نرخ پس‌انداز"
                value={`${financialData.savingsRate}%`}
                valueClassName={financialData.savingsRate >= 20 ? "text-success" : financialData.savingsRate >= 10 ? "text-warning" : "text-muted-foreground"}
              />
            )}
          </div>
        </div>
      </div>

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
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs font-medium py-2 px-1 -ml-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-primary"
          >
            همه
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-muted">
              <Receipt className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            {financialData.recentTransactions.map((transaction, idx) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className={cn(
                    "flex items-center gap-3 p-4 active:bg-accent/30 transition-colors",
                    idx > 0 && "border-t border-border"
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

// --- Sub-components ---

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  type: 'income' | 'expense';
}

function SummaryCard({ icon: Icon, label, value, type }: SummaryCardProps) {
  const isIncome = type === 'income';
  
  return (
    <div className="relative glass-card rounded-2xl p-4">
      {/* Icon circle - top right */}
      <div className={cn(
        "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center",
        isIncome ? "bg-success" : "bg-destructive"
      )}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
      </div>
      
      <div className="pt-12">
        <p className="text-xs font-medium mb-2 text-muted-foreground">{label}</p>
        <p className={cn(
          "text-[17px] font-bold tabular-nums truncate",
          isIncome ? "text-success" : "text-destructive"
        )}>
          {value}
        </p>
      </div>
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
  color: 'primary' | 'success' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function QuickActionButton({ icon: Icon, label, color, onClick, disabled, ariaLabel }: QuickActionButtonProps) {
  const colorClass = {
    primary: 'text-primary',
    success: 'text-success',
    destructive: 'text-destructive',
  }[color];

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      aria-label={ariaLabel || label}
      className={cn(
        "flex flex-col items-center gap-2.5 min-w-0 py-2 px-3 rounded-2xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"
      )}
    >
      <Icon className={cn("w-7 h-7", colorClass)} strokeWidth={2} />
      <span className="text-xs font-bold truncate max-w-[80px] leading-relaxed text-muted-foreground">{label}</span>
    </button>
  );
}
