import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Wallet, Zap } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-[2rem] animate-slide-up">
      {/* Main Balance Card with Glass Effect */}
      <div className="relative p-6 sm:p-8">
        {/* Background layers */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-float" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse-soft" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} 
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-lg" />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">SiaFlow</p>
                <p className="text-white text-sm font-semibold">موجودی کل</p>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-md border",
              isPositive 
                ? "bg-white/20 border-white/20 text-white" 
                : "bg-white/10 border-white/10 text-white/80"
            )}>
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{isPositive ? 'مثبت' : 'منفی'}</span>
            </div>
          </div>

          {/* Balance Amount */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <p className="text-5xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/50 text-sm">تومان</span>
              <Sparkles className="w-4 h-4 text-white/40 animate-pulse-soft" />
            </div>
          </div>

          {/* Income & Expense Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Income */}
            <div className="group relative overflow-hidden rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all duration-400 hover:scale-[1.02]">
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/25 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-medium">درآمد</p>
                  <p className="text-white font-bold text-base sm:text-lg">{formatCurrency(income)}</p>
                </div>
              </div>
            </div>

            {/* Expense */}
            <div className="group relative overflow-hidden rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all duration-400 hover:scale-[1.02]">
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-400/25 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <ArrowDownRight className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-medium">هزینه</p>
                  <p className="text-white font-bold text-base sm:text-lg">{formatCurrency(expense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative ring elements */}
        <div className="absolute top-6 right-6 w-24 h-24 border-2 border-white/10 rounded-full" />
        <div className="absolute top-8 right-8 w-20 h-20 border border-white/5 rounded-full" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border border-white/10 rounded-full" />
      </div>

      {/* Bottom Reflection/Glow */}
      <div className="h-6 bg-gradient-to-b from-primary/30 to-transparent rounded-b-[2rem] blur-sm -mt-2" />
    </div>
  );
}