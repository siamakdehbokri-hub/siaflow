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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/30 p-6 animate-fade-in">
      {/* Ambient glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20",
        isPositive ? "bg-success" : "bg-destructive"
      )} />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">موجودی کل</p>
            <p className="text-xs text-muted-foreground/70">این ماه</p>
          </div>
        </div>
        
        {savingsRate > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{Math.round(savingsRate)}% پس‌انداز</span>
          </div>
        )}
      </div>
      
      {/* Main Balance */}
      <div className="relative mb-8">
        <p className={cn(
          "text-4xl sm:text-5xl font-bold tracking-tight",
          isPositive ? "text-foreground" : "text-destructive"
        )}>
          {formatCurrency(Math.abs(balance))}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isPositive ? "تومان" : "تومان منفی"}
        </p>
      </div>
      
      {/* Income / Expense Summary */}
      <div className="relative grid grid-cols-2 gap-4">
        {/* Income */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/5 border border-success/10">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">درآمد</p>
            <p className="text-sm font-semibold text-success truncate">
              {formatCurrency(income)}
            </p>
          </div>
        </div>
        
        {/* Expense */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">هزینه</p>
            <p className="text-sm font-semibold text-destructive truncate">
              {formatCurrency(expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
