import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  const { formatAmountCompact, currencyInfo } = useCurrency();

  const isPositive = balance >= 0;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl animate-slide-up">
      {/* Main Balance Card */}
      <div className="relative p-6 bg-primary">
        {/* Subtle decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">حساب من</p>
                <p className="text-white text-sm font-bold">موجودی کل</p>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl",
              isPositive 
                ? "bg-white/15 text-white" 
                : "bg-white/15 text-white"
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span className="text-xs font-bold">{isPositive ? 'مثبت' : 'منفی'}</span>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="mb-6 text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-4xl font-black text-white tracking-tight">
                {formatAmountCompact(Math.abs(balance))}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/60 text-sm font-medium">{currencyInfo.symbol}</span>
                {savingsRate > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white font-bold">
                    {savingsRate}% پس‌انداز
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Income & Expense Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="rounded-2xl bg-white/10 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/60 text-xs font-medium">درآمد</p>
                <p className="text-white font-bold text-sm truncate">{formatAmountCompact(income)}</p>
              </div>
            </div>

            {/* Expense */}
            <div className="rounded-2xl bg-white/10 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/60 text-xs font-medium">هزینه</p>
                <p className="text-white font-bold text-sm truncate">{formatAmountCompact(expense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
