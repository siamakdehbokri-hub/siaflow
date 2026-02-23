import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Plus, Receipt, PieChart, Landmark, TrendingUp, TrendingDown, Wallet, PiggyBank, type LucideIcon } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { isInCurrentJalaliMonth, formatPersianDateFull, isTodayJalali } from '@/utils/persianDate';
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
    
    const saving = monthlyTransactions
      .filter(t => t.type === 'saving')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense - saving;
    
    return {
      income,
      expense,
      saving,
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

      {/* Hero Card - Glassmorphic */}
      <div className="relative overflow-hidden rounded-3xl p-6 glass-heavy">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-chart-5/10 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-chart-4/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
                امروز چقدر خرج کردی؟
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black tabular-nums tracking-tight text-foreground">
                  {formatAmountCompact(financialData.todayExpense)}
                </span>
                <span className="text-base text-muted-foreground">{currencyInfo.symbol}</span>
              </div>
            </div>
            
            {/* Glassmorphic Add button */}
            <button
              onClick={() => onAddTransaction()}
              className="relative w-14 h-14 rounded-2xl bg-primary flex items-center justify-center active:scale-95 transition-all shrink-0 shadow-lg shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="افزودن تراکنش"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/25 to-transparent rounded-2xl" />
              <Plus className="w-7 h-7 text-primary-foreground relative z-10" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Quick actions - Glassmorphic pill style */}
          <div className="flex items-center justify-around mt-6 pt-5 border-t border-border/30">
            <QuickActionButton 
              icon={Receipt} 
              label="تراکنش‌ها"
              color="primary"
              onClick={onViewAllTransactions}
            />
            <QuickActionButton 
              icon={PieChart} 
              label="بودجه‌بندی"
              color="success"
              onClick={onViewAllTransactions}
            />
            <QuickActionButton 
              icon={Landmark} 
              label="بدهی‌ها"
              color="destructive"
              onClick={() => onOpenDebts?.()}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards - Glassmorphic */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl p-4 glass-card">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-success/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-success/20">
                <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">درآمد ماه</p>
            </div>
            <p className="text-lg font-black text-success tabular-nums truncate">
              {formatAmountCompact(financialData.income)}
            </p>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl p-4 glass-card">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-destructive/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-destructive/20">
                <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2} />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">هزینه ماه</p>
            </div>
            <p className="text-lg font-black text-destructive tabular-nums truncate">
              {formatAmountCompact(financialData.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance Detail Card - Glassmorphic */}
      <div className="relative overflow-hidden rounded-3xl glass-heavy">
        <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-chart-4/8 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center border border-primary/20">
              <Wallet className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">مانده دارایی</p>
              <p className="text-xs text-muted-foreground">خلاصه مالی این ماه</p>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="text-center mb-4 py-3.5 rounded-2xl glass-subtle">
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
              label="کل درآمد"
              value={formatAmountCompact(financialData.income)}
              valueColor="text-success"
              bgClass="bg-success/8 border-success/15"
            />
            <DetailRow
              icon={<ArrowDownRight className="w-4 h-4 text-destructive" strokeWidth={2} />}
              label="کل هزینه"
              value={formatAmountCompact(financialData.expense)}
              valueColor="text-destructive"
              bgClass="bg-destructive/8 border-destructive/15"
            />
            {financialData.saving > 0 && (
              <DetailRow
                icon={<PiggyBank className="w-4 h-4 text-chart-4" strokeWidth={2} />}
                label="پس‌انداز"
                value={formatAmountCompact(financialData.saving)}
                valueColor="text-chart-4"
                bgClass="bg-chart-4/8 border-chart-4/15"
              />
            )}
            <DetailRow
              icon={<Wallet className="w-4 h-4 text-primary" strokeWidth={2} />}
              label="مانده خالص"
              value={formatAmountCompact(Math.abs(financialData.balance))}
              valueColor={financialData.balance >= 0 ? "text-primary" : "text-destructive"}
              bgClass="bg-primary/8 border-primary/15"
            />
            {financialData.income > 0 && (
              <DetailRow
                icon={<TrendingUp className="w-4 h-4 text-chart-3" strokeWidth={2} />}
                label="نرخ پس‌انداز"
                value={`${Math.round((financialData.saving / financialData.income) * 100)}%`}
                valueColor="text-chart-3"
                bgClass="bg-chart-3/8 border-chart-3/15"
              />
            )}
          </div>
        </div>
      </div>

      {/* Auto-Savings Banner - Glassmorphic */}
      {showAutoSavings && onOpenAutoSavings && (
        <button
          onClick={onOpenAutoSavings}
          className="w-full relative overflow-hidden flex items-center gap-3 rounded-2xl p-4 active:opacity-80 transition-opacity text-right glass-card"
        >
          <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-primary/8 blur-2xl pointer-events-none" />
          <div className="relative z-10 w-11 h-11 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-primary/20">
            <PiggyBank className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-sm font-bold text-foreground">پس‌انداز کن برای آینده‌ای بهتر!</p>
            <p className="text-xs text-muted-foreground mt-0.5">از مانده ماه قبل پس‌انداز کن 💰</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 relative z-10" strokeWidth={2} />
        </button>
      )}

      {/* Recent Transactions - Glassmorphic */}
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
          <div className="rounded-2xl p-6 text-center glass-card">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-border/30">
              <Receipt className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="rounded-2xl divide-y divide-border/30 overflow-hidden glass-card">
            {financialData.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-4 active:bg-muted/20 transition-colors"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm border",
                    isIncome 
                      ? "bg-success/12 border-success/20" 
                      : "bg-destructive/12 border-destructive/20"
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

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  bgClass: string;
}

function DetailRow({ icon, label, value, valueColor, bgClass }: DetailRowProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 p-2.5 rounded-xl border backdrop-blur-sm", bgClass)}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-sm font-bold tabular-nums", valueColor)}>{value}</span>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: 'primary' | 'success' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
}

function QuickActionButton({ icon: Icon, label, color, onClick, disabled }: QuickActionButtonProps) {
  const colorMap = {
    primary: 'bg-primary/15 border-primary/20 text-primary',
    success: 'bg-success/15 border-success/20 text-success',
    destructive: 'bg-destructive/15 border-destructive/20 text-destructive',
  };

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
        "relative w-13 h-13 rounded-2xl flex items-center justify-center backdrop-blur-sm border",
        colorMap[color]
      )}>
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <span className="text-xs font-bold text-foreground truncate max-w-[80px] leading-relaxed">{label}</span>
    </button>
  );
}
