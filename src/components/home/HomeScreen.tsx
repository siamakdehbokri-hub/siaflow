import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Clock, Plus, Calendar, Users } from 'lucide-react';
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
    <div className="space-y-3">
      {/* Welcome & Date Section */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground truncate">
            سلام، {userName} 👋
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            خوش آمدی!
          </p>
        </div>
        <div className="text-left shrink-0">
          <p className="text-xs font-medium text-muted-foreground">{persianDate}</p>
        </div>
      </div>

      {/* Hero Card - Today's spending */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">امروز چقدر خرج کردی؟</p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-2xl font-bold tabular-nums truncate">
                {formatCompactCurrency(financialData.expense)}
              </span>
              <span className="text-xs text-muted-foreground">تومان</span>
            </div>
          </div>
          
          {/* Quick add button */}
          <button
            onClick={() => onAddTransaction()}
            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors shrink-0"
          >
            <Plus className="w-6 h-6 text-primary" />
          </button>
        </div>
        
        {/* Quick action icons */}
        <div className="flex items-center justify-around mt-4 pt-3 border-t border-border">
          <QuickActionButton 
            icon={Calendar} 
            label="تراکنش‌ها" 
            color="bg-blue-500"
            onClick={onViewAllTransactions}
          />
          <QuickActionButton 
            icon={Calendar} 
            label="بودجه‌بندی" 
            color="bg-green-500"
            onClick={() => {}}
          />
          <QuickActionButton 
            icon={Users} 
            label="دونگ‌ها" 
            color="bg-orange-500"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card rounded-xl p-3 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 text-success" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground">درآمد ماه</p>
              <p className="text-sm font-bold text-success tabular-nums truncate">
                {formatCompactCurrency(financialData.income)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-3 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground">هزینه ماه</p>
              <p className="text-sm font-bold text-destructive tabular-nums truncate">
                {formatCompactCurrency(financialData.expense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">فعالیت اخیر</h3>
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs text-primary"
          >
            همه
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="bg-card rounded-xl p-5 border border-border text-center">
            <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
            {financialData.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-2 p-3 active:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isIncome ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.category}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {transaction.description || '—'}
                    </p>
                  </div>
                  
                  <div className="text-left shrink-0">
                    <p className={cn(
                      "text-xs font-semibold tabular-nums",
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  onClick: () => void;
}

function QuickActionButton({ icon: Icon, label, color, onClick }: QuickActionButtonProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 min-w-0">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-[10px] text-foreground truncate max-w-[60px]">{label}</span>
    </button>
  );
}
