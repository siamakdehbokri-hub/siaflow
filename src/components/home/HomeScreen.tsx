import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Clock, Plus, Wallet, PieChart, Users, type LucideIcon } from 'lucide-react';
import { Transaction, Category } from '@/types/expense';
import { isInCurrentJalaliMonth, formatCurrency, formatPersianDateFull } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface HomeScreenProps {
  transactions: Transaction[];
  categories: Category[];
  userName?: string;
  onAddTransaction: (type?: string) => void;
  onViewAllTransactions: () => void;
}

// Format currency with compact notation for mobile
function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)} میلیارد`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)} میلیون`;
  }
  return formatCurrency(amount);
}

export function HomeScreen({
  transactions,
  categories,
  userName = 'کاربر',
  onAddTransaction,
  onViewAllTransactions,
}: HomeScreenProps) {
  const financialData = useMemo(() => {
    const monthlyTransactions = transactions.filter(t => isInCurrentJalaliMonth(t.date));
    
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
      balance,
      recentTransactions: transactions.slice(0, 3),
    };
  }, [transactions]);

  const today = new Date();
  const persianDate = formatPersianDateFull(today.toISOString());

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Welcome & Date Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground truncate">
            سلام، {userName} 👋
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            خوش آمدی!
          </p>
        </div>
        <div className="text-left shrink-0">
          <p className="text-xs font-medium text-muted-foreground">{persianDate}</p>
        </div>
      </div>

      {/* Hero Card - Today's spending */}
      <div className="bg-card rounded-2xl p-5 border-2 border-border/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">امروز چقدر خرج کردی؟</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold tabular-nums truncate">
                {formatCompactCurrency(financialData.expense)}
              </span>
              <span className="text-sm text-muted-foreground">تومان</span>
            </div>
          </div>
          
          {/* Quick add button - 48px touch target */}
          <button
            onClick={() => onAddTransaction()}
            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="افزودن تراکنش"
          >
            <Plus className="w-6 h-6 text-primary" strokeWidth={2} />
          </button>
        </div>
        
        {/* Quick action icons - 44px touch targets */}
        <div className="flex items-center justify-around mt-5 pt-4 border-t border-border">
          <QuickActionButton 
            icon={Wallet} 
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
            icon={Users} 
            label="دونگ‌ها" 
            bgColor="bg-warning"
            onClick={() => {}}
            disabled
          />
        </div>
      </div>

      {/* Summary Cards - Consistent sizing */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border-2 border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground">درآمد ماه</p>
              <p className="text-sm font-bold text-success tabular-nums truncate mt-0.5">
                {formatCompactCurrency(financialData.income)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-4 border-2 border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground">هزینه ماه</p>
              <p className="text-sm font-bold text-destructive tabular-nums truncate mt-0.5">
                {formatCompactCurrency(financialData.expense)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                      {isIncome ? '+' : '-'}{formatCompactCurrency(transaction.amount)}
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
        "flex flex-col items-center gap-2 min-w-0 py-1 px-2 rounded-xl transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bgColor)}>
        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
      <span className="text-[11px] font-medium text-foreground truncate max-w-[70px]">{label}</span>
    </button>
  );
}
