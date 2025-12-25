import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/data/mockData';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <Card className="gradient-primary border-0 shadow-glow animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary-foreground/20">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-primary-foreground/80 text-sm font-medium">موجودی کل</span>
        </div>
        
        <p className="text-3xl font-bold text-primary-foreground mb-6">
          {formatCurrency(balance)}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/10">
            <div className="p-2 rounded-lg bg-success/20">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">درآمد</p>
              <p className="text-sm font-semibold text-primary-foreground">
                {formatCurrency(income)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/10">
            <div className="p-2 rounded-lg bg-destructive/20">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">هزینه</p>
              <p className="text-sm font-semibold text-primary-foreground">
                {formatCurrency(expense)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
