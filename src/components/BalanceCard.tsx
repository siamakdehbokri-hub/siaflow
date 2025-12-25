import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/persianDate';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <Card className="gradient-primary border-0 shadow-glow animate-slide-up overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary-foreground/20">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="text-primary-foreground/80 text-xs sm:text-sm font-medium">موجودی کل</span>
        </div>
        
        <p className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4 sm:mb-6">
          {formatCurrency(balance)}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary-foreground/10">
            <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-success/20">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-primary-foreground/70">درآمد</p>
              <p className="text-xs sm:text-sm font-semibold text-primary-foreground truncate">
                {formatCurrency(income)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary-foreground/10">
            <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-destructive/20">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-primary-foreground/70">هزینه</p>
              <p className="text-xs sm:text-sm font-semibold text-primary-foreground truncate">
                {formatCurrency(expense)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
