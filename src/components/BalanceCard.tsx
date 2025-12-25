import { ArrowUpRight, ArrowDownRight, Wallet, Zap, TrendingUp, TrendingDown } from 'lucide-react';
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
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-[2rem] animate-slide-up">
      {/* Main Balance Card with Enhanced Glass Effect */}
      <div className="relative p-5 sm:p-7">
        {/* Background layers */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20" />
        
        {/* Animated gradient orbs - Enhanced */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 animate-float" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-glow/30 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 animate-float" style={{ animationDelay: '2s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-30" 
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            backgroundSize: '200% 100%'
          }} 
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                {/* Animated glow */}
                <div className="absolute inset-0 rounded-xl bg-white/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-medium tracking-wider uppercase">حساب من</p>
                <p className="text-white text-sm font-bold">موجودی کل</p>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all duration-300",
              isPositive 
                ? "bg-emerald-400/20 border-emerald-400/30 text-emerald-200" 
                : "bg-rose-400/20 border-rose-400/30 text-rose-200"
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold">{isPositive ? 'مثبت' : 'منفی'}</span>
            </div>
          </div>

          {/* Balance Amount - Enhanced */}
          <div className="mb-6 text-center">
            <div className="inline-flex flex-col items-center">
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-2xl animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                {formatCurrency(balance)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/60 text-sm font-medium">تومان</span>
                {savingsRate > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold">
                    {savingsRate}% پس‌انداز
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Income & Expense Cards - Enhanced Glass */}
          <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.03]">
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl" />
              
              {/* Hover glow */}
              <div className="absolute inset-0 bg-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative p-3.5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-400/30">
                    <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="absolute -inset-1 bg-emerald-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white/60 text-[10px] font-medium">درآمد</p>
                  <p className="text-white font-bold text-sm sm:text-base truncate">{formatCurrency(income)}</p>
                </div>
              </div>
            </div>

            {/* Expense */}
            <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.03]">
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl" />
              
              {/* Hover glow */}
              <div className="absolute inset-0 bg-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative p-3.5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400/30 to-rose-500/20 backdrop-blur-sm flex items-center justify-center border border-rose-400/30">
                    <ArrowDownRight className="w-5 h-5 text-rose-300" />
                  </div>
                  <div className="absolute -inset-1 bg-rose-400/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white/60 text-[10px] font-medium">هزینه</p>
                  <p className="text-white font-bold text-sm sm:text-base truncate">{formatCurrency(expense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 border border-white/10 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-4 left-4 w-14 h-14 border border-white/5 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      {/* Bottom Glow */}
      <div className="h-4 bg-gradient-to-b from-primary/40 to-transparent rounded-b-[2rem] blur-md -mt-1" />
    </div>
  );
}