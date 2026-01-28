import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/persianDate';

interface BalanceHeroProps {
  balance: number;
  income: number;
  expense: number;
  savingsRate?: number;
}

export function BalanceHero({ balance, income, expense, savingsRate = 0 }: BalanceHeroProps) {
  const isPositive = balance >= 0;
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border/40 p-5 animate-fade-in shadow-sm">
      {/* Ambient glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none",
        isPositive ? "bg-success" : "bg-destructive"
      )} />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">موجودی کل</p>
            <p className="text-xs text-muted-foreground/70">این ماه</p>
          </div>
        </div>
        
        {savingsRate > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success/10 text-success">
            <TrendingUp className="w-4 h-4" strokeWidth={2} />
            <span className="text-xs font-semibold">{Math.round(savingsRate)}% پس‌انداز</span>
          </div>
        )}
      </div>
      
      {/* Main Balance */}
      <div className="relative mb-6">
        <p className={cn(
          "text-4xl sm:text-5xl font-bold tracking-tight",
          isPositive ? "text-foreground" : "text-destructive"
        )}>
          {formatCurrency(Math.abs(balance))}
        </p>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {isPositive ? "تومان" : "تومان منفی"}
        </p>
      </div>
      
      {/* Income / Expense Summary - 48px height for touch */}
      <div className="relative grid grid-cols-2 gap-3">
        {/* Income */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/5 border-2 border-success/15">
          <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6 text-success" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">درآمد</p>
            <p className="text-sm font-bold text-success truncate">
              {formatCurrency(income)}
            </p>
          </div>
        </div>
        
        {/* Expense */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-destructive/5 border-2 border-destructive/15">
          <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-6 h-6 text-destructive" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">هزینه</p>
            <p className="text-sm font-bold text-destructive truncate">
              {formatCurrency(expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
