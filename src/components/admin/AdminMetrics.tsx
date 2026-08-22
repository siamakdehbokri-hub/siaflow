import { Wallet, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/persianDate';

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalAccountBalance: number;
  totalGoalProgress: number;
  netBalance?: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalCategories: number;
  totalDebts?: number;
  totalGoals?: number;
  totalAccounts?: number;
  totalTransfers?: number;
}

interface AdminMetricsProps {
  financialSummary: FinancialSummary | null;
  stats: Stats | null;
  isLoading: boolean;
}

export function AdminMetrics({ financialSummary, stats, isLoading }: AdminMetricsProps) {
  return (
    <div className="space-y-3">
      {/* Primary Metric - System Balance */}
      <div className="glass-heavy rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">موجودی کل سیستم</p>
            <p className="text-2xl font-bold text-foreground font-mono truncate" dir="ltr">
              {isLoading ? '...' : formatCurrency(financialSummary?.totalAccountBalance ?? 0)}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">تراز خالص سیستم</span>
          <span
            className={cn(
              "text-sm font-bold font-mono",
              (financialSummary?.netBalance ?? 0) >= 0 ? "text-success" : "text-destructive"
            )}
            dir="ltr"
          >
            {isLoading ? '...' : formatCurrency(financialSummary?.netBalance ?? 0)}
          </span>
        </div>
      </div>

      {/* Secondary Metrics - Grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={TrendingUp}
          label="کل درآمد"
          value={formatCurrency(financialSummary?.totalIncome ?? 0)}
          variant="success"
          isLoading={isLoading}
        />
        <MetricCard
          icon={TrendingDown}
          label="کل هزینه"
          value={formatCurrency(financialSummary?.totalExpense ?? 0)}
          variant="danger"
          isLoading={isLoading}
        />
      </div>

      {/* Tertiary Metrics - Compact Stats */}
      <div className="grid grid-cols-4 gap-2">
        <CompactStat label="کاربران" value={stats?.totalUsers ?? 0} isLoading={isLoading} />
        <CompactStat label="فعال" value={stats?.activeUsers ?? 0} variant="success" isLoading={isLoading} />
        <CompactStat label="تراکنش" value={stats?.totalTransactions ?? 0} isLoading={isLoading} />
        <CompactStat label="دسته" value={stats?.totalCategories ?? 0} isLoading={isLoading} />
        <CompactStat label="حساب" value={stats?.totalAccounts ?? 0} isLoading={isLoading} />
        <CompactStat label="بدهی" value={stats?.totalDebts ?? 0} isLoading={isLoading} />
        <CompactStat label="هدف" value={stats?.totalGoals ?? 0} isLoading={isLoading} />
        <CompactStat label="انتقال" value={stats?.totalTransfers ?? 0} isLoading={isLoading} />
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  variant: 'success' | 'danger' | 'neutral';
  isLoading: boolean;
}

function MetricCard({ icon: Icon, label, value, variant, isLoading }: MetricCardProps) {
  const styles = {
    success: { card: 'border-success/20 bg-success/5', icon: 'bg-success/15 text-success', text: 'text-success' },
    danger: { card: 'border-destructive/20 bg-destructive/5', icon: 'bg-destructive/15 text-destructive', text: 'text-destructive' },
    neutral: { card: 'border-border bg-card', icon: 'bg-muted text-muted-foreground', text: 'text-foreground' },
  };

  const s = styles[variant];

  return (
    <div className={cn("glass rounded-xl border p-3", s.card)}>
      <div className="flex items-center gap-2.5">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.icon)}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
          <p className={cn("text-sm font-bold font-mono truncate", s.text)} dir="ltr">
            {isLoading ? '...' : value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface CompactStatProps {
  label: string;
  value: number;
  variant?: 'default' | 'success';
  isLoading: boolean;
}

function CompactStat({ label, value, variant = 'default', isLoading }: CompactStatProps) {
  return (
    <div className="glass rounded-xl p-2.5 text-center">
      <p className={cn(
        "text-lg font-bold font-mono",
        variant === 'success' ? 'text-success' : 'text-foreground'
      )}>
        {isLoading ? '-' : value}
      </p>
      <p className="text-[9px] text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
