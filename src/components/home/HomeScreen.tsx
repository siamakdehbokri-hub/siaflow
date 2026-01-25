import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, Clock } from 'lucide-react';
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
  // Calculate financial data for current Jalali month
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

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'روز بخیر';
    if (hour < 21) return 'عصر بخیر';
    return 'شب بخیر';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Zone 1: Balance Hero - Mobile optimized */}
      <div className="text-center py-5 sm:py-6 animate-fade-in">
        <p className="text-sm sm:text-base text-muted-foreground mb-1">
          {getGreeting()}، {userName}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tabular-nums">
          {formatCurrency(financialData.balance)}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">موجودی این ماه</p>
        
        {/* Income/Expense Summary - Better mobile spacing */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <div className="text-right">
              <p className="text-[11px] sm:text-xs text-muted-foreground">درآمد</p>
              <p className="text-sm sm:text-base font-semibold text-success tabular-nums">{formatCurrency(financialData.income)}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>
            <div className="text-right">
              <p className="text-[11px] sm:text-xs text-muted-foreground">هزینه</p>
              <p className="text-sm sm:text-base font-semibold text-destructive tabular-nums">{formatCurrency(financialData.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Two Big Action Buttons - Mobile optimized touch targets */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => onAddTransaction('expense')}
          className="group flex flex-col items-center gap-2.5 sm:gap-3 p-5 sm:p-6 rounded-2xl bg-card border border-border/30 hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-300 active:scale-[0.97] touch-target-lg"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownRight className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground">ثبت هزینه</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">خرید، قبض، ...</p>
          </div>
        </button>

        <button
          onClick={() => onAddTransaction('income')}
          className="group flex flex-col items-center gap-2.5 sm:gap-3 p-5 sm:p-6 rounded-2xl bg-card border border-border/30 hover:border-success/30 hover:bg-success/5 transition-all duration-300 active:scale-[0.97] touch-target-lg"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-success" />
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground">ثبت درآمد</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">حقوق، هدیه، ...</p>
          </div>
        </button>
      </div>

      {/* Zone 3: Recent Transactions - Mobile optimized */}
      <div className="space-y-2.5 sm:space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">فعالیت اخیر</h3>
          <button 
            onClick={onViewAllTransactions}
            className="flex items-center gap-1 text-xs text-primary hover:underline touch-target py-2 px-1"
          >
            همه
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {financialData.recentTransactions.length === 0 ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/30 text-center">
            <Clock className="w-9 h-9 sm:w-10 sm:h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground/70 mt-1">با دکمه‌های بالا اولین تراکنش را ثبت کنید</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border/30 divide-y divide-border/30 overflow-hidden">
            {financialData.recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center gap-3 p-3.5 sm:p-4 active:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0",
                    isIncome ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {isIncome ? (
                      <ArrowUpRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-destructive" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-foreground truncate">
                      {transaction.category}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      {transaction.description || '—'}
                    </p>
                  </div>
                  
                  <div className="text-left shrink-0">
                    <p className={cn(
                      "text-sm sm:text-base font-semibold tabular-nums",
                      isIncome ? "text-success" : "text-destructive"
                    )}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {formatPersianDateFull(transaction.date).split(' ')[0]}
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
