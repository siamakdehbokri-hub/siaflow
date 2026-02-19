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
    
    // Today's expense - filter transactions that are from today in Jalali calendar
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
          // Sort by date descending, then by id as tiebreaker (newest first)
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
      {/* Welcome & Date Section - Improved spacing */}
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

      {/* Hero Card - Today's spending - Enhanced visual hierarchy */}
      <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2 leading-relaxed">
              امروز چقدر خرج کردی؟
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-bold tabular-nums tracking-tight">
                {formatAmountCompact(financialData.todayExpense)}
              </span>
              <span className="text-base text-muted-foreground">{currencyInfo.symbol}</span>
            </div>
          </div>
          
          {/* Quick add button - 48px touch target */}
          <button
            onClick={() => onAddTransaction()}
            className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shrink-0 shadow-lg shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="افزودن تراکنش"
          >
            <Plus className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Quick action icons - 48px touch targets */}
        <div className="flex items-center justify-around mt-6 pt-5 border-t-2 border-border/60">
          <QuickActionButton 
            icon={Receipt} 
            label="تراکنش‌ها" 
            bgColor="bg-primary"
            onClick={onViewAllTransactions}
          />
          <QuickActionButton 
            icon={PieChart} 
            label="بودجه‌بندی" 
            bgColor="bg-success"
            onClick={onViewAllTransactions}
          />
          <QuickActionButton 
            icon={Landmark} 
            label="بدهی‌ها" 
            bgColor="bg-destructive"
            onClick={() => onOpenDebts?.()}
          />
        </div>
      </div>

      {/* Summary Cards - Enhanced visual hierarchy with larger numbers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 border-2 border-success/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6 text-success" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">درآمد ماه</p>
          </div>
          <p className="text-xl font-bold text-success tabular-nums truncate">
            {formatAmountCompact(financialData.income)}
          </p>
        </div>
        
        <div className="bg-card rounded-2xl p-5 border-2 border-destructive/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-6 h-6 text-destructive" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">هزینه ماه</p>
          </div>
          <p className="text-xl font-bold text-destructive tabular-nums truncate">
            {formatAmountCompact(financialData.expense)}
          </p>
        </div>
      </div>

      {/* Auto-Savings Suggestion Banner */}
      {showAutoSavings && onOpenAutoSavings && (
        <button
          onClick={onOpenAutoSavings}
          className="w-full flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 active:opacity-80 transition-opacity text-right"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <PiggyBank className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">پیشنهاد پس‌انداز هوشمند</p>
            <p className="text-xs text-muted-foreground mt-0.5">مانده این ماه قابل پس‌انداز است</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={2} />
        </button>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">فعالیت اخیر</h3>
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
            <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" strokeWidth={1.5} />
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
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    isIncome ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2} />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {transaction.category}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {transaction.description || '—'}
                    </p>
                  </div>
                  
                  <div className="text-left shrink-0">
                    <p className={cn(
                      "text-sm font-bold tabular-nums",
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
  bgColor: string;
  onClick: () => void;
  disabled?: boolean;
}

function QuickActionButton({ icon: Icon, label, bgColor, onClick, disabled }: QuickActionButtonProps) {
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
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-md", bgColor)}>
        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
      </div>
      <span className="text-xs font-semibold text-foreground truncate max-w-[80px] leading-relaxed">{label}</span>
    </button>
  );
}
