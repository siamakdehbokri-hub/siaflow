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
      {/* Main Balance Card - Glassmorphic gradient */}
      <div className="relative p-6 bg-primary">
        {/* Decorative glass layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/12 via-transparent to-primary-foreground/0" />
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary-foreground/8 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary-foreground/5 blur-2xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-primary-foreground/15" style={{ background: 'hsl(0 0% 100% / 0.12)', backdropFilter: 'blur(8px)' }}>
                <Wallet className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
              </div>
              <div>
                <p className="text-primary-foreground/60 text-xs font-medium">حساب من</p>
                <p className="text-primary-foreground text-sm font-bold">موجودی کل</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-foreground/15" style={{ background: 'hsl(0 0% 100% / 0.12)', backdropFilter: 'blur(8px)' }}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" /> : <TrendingDown className="w-3.5 h-3.5 text-primary-foreground" />}
              <span className="text-xs font-bold text-primary-foreground">{isPositive ? 'مثبت' : 'منفی'}</span>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="mb-6 text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-4xl font-black text-primary-foreground tracking-tight">
                {formatAmountCompact(Math.abs(balance))}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-primary-foreground/60 text-sm font-medium">{currencyInfo.symbol}</span>
                {savingsRate > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full text-primary-foreground font-bold border border-primary-foreground/15" style={{ background: 'hsl(0 0% 100% / 0.15)' }}>
                    {savingsRate}% پس‌انداز
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Income & Expense Cards - Glass pills */}
          <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="rounded-2xl p-3.5 flex items-center gap-3 border border-primary-foreground/10" style={{ background: 'hsl(0 0% 100% / 0.1)', backdropFilter: 'blur(8px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-primary-foreground/10" style={{ background: 'hsl(var(--success) / 0.25)' }}>
                <ArrowUpRight className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-primary-foreground/60 text-xs font-medium">درآمد</p>
                <p className="text-primary-foreground font-bold text-sm truncate">{formatAmountCompact(income)}</p>
              </div>
            </div>

            {/* Expense */}
            <div className="rounded-2xl p-3.5 flex items-center gap-3 border border-primary-foreground/10" style={{ background: 'hsl(0 0% 100% / 0.1)', backdropFilter: 'blur(8px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-primary-foreground/10" style={{ background: 'hsl(var(--destructive) / 0.25)' }}>
                <ArrowDownRight className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-primary-foreground/60 text-xs font-medium">هزینه</p>
                <p className="text-primary-foreground font-bold text-sm truncate">{formatAmountCompact(expense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
