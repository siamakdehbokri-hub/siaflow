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
    <div className="space-y-4">
      {/* Welcome & Date Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            سلام، {userName} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            خوش آمدی!
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{persianDate}</p>
        </div>
      </div>

      {/* Hero Card - Today's spending */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">امروز چقدر خرج کردی؟</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">
                {formatCurrency(financialData.expense)}
              </span>
              <span className="text-sm text-muted-foreground">تومان</span>
            </div>
          </div>
          
          {/* Quick add button */}
          <button
            onClick={() => onAddTransaction()}
            className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-7 h-7 text-primary" />
          </button>
        </div>
        
        {/* Quick action icons */}
        <div className="flex items-center justify-around mt-6 pt-4 border-t border-border">
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
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">درآمد ماه</p>
              <p className="text-base font-bold text-success tabular-nums">
                {formatCurrency(financialData.income)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">هزینه ماه</p>
              <p className="text-base font-bold text-destructive tabular-nums">
                {formatCurrency(financialData.expense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">فعالیت اخیر</h3>
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs text-primary"
          >
            همه
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <Clock className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
            {financialData.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-4 active:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isIncome ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.category}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {transaction.description || '—'}
                    </p>
                  </div>
                  
                  <div className="text-left">
                    <p className={cn(
                      "text-sm font-semibold tabular-nums",
                      isIncome ? "text-success" : "text-destructive"
                    )}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
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
    <button onClick={onClick} className="flex flex-col items-center gap-2">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs text-foreground">{label}</span>
    </button>
  );
}
