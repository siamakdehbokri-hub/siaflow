import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.abs(amount));
  };

  const isPositive = balance >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl animate-fade-in">
      {/* Main Balance Card */}
      <div className="relative gradient-primary p-6 sm:p-8 shadow-float">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Sparkle Icon */}
        <div className="absolute top-4 left-4">
          <Sparkles className="w-5 h-5 text-white/30 animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs">SiaFlow</p>
                <p className="text-white/90 text-sm font-medium">موجودی کل</p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium",
              isPositive ? "bg-white/20 text-white" : "bg-white/10 text-white/80"
            )}>
              <TrendingUp className={cn("w-3 h-3", !isPositive && "rotate-180")} />
              {isPositive ? 'مثبت' : 'منفی'}
            </div>
          </div>

          {/* Balance Amount */}
          <div className="mb-6">
            <p className={cn(
              "text-4xl sm:text-5xl font-black text-white tracking-tight",
              !isPositive && "text-white/90"
            )}>
              {formatCurrency(balance)}
            </p>
            <p className="text-white/60 text-sm mt-1">تومان</p>
          </div>

          {/* Income & Expense */}
          <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-white/60 text-xs">درآمد</p>
                <p className="text-white font-bold text-sm">{formatCurrency(income)}</p>
              </div>
            </div>

            {/* Expense */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-400/20 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <p className="text-white/60 text-xs">هزینه</p>
                <p className="text-white font-bold text-sm">{formatCurrency(expense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Reflection */}
      <div className="h-4 bg-gradient-to-b from-primary/20 to-transparent rounded-b-3xl" />
    </div>
  );
}
