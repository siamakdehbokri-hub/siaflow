import { Wallet, Users, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/persianDate';

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalAccountBalance: number;
  totalGoalProgress: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalCategories: number;
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
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">موجودی کل سیستم</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono" dir="ltr">
                {isLoading ? '...' : formatCurrency(financialSummary?.totalAccountBalance ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics - Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Total Income */}
        <MetricCard
          icon={TrendingUp}
          label="کل درآمد"
          value={formatCurrency(financialSummary?.totalIncome ?? 0)}
          variant="success"
          isLoading={isLoading}
        />
        
        {/* Total Expense */}
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
  const variantStyles = {
    success: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50',
    danger: 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50',
    neutral: 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900',
  };

  const iconStyles = {
    success: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
    danger: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  const textStyles = {
    success: 'text-emerald-700 dark:text-emerald-300',
    danger: 'text-red-700 dark:text-red-300',
    neutral: 'text-slate-700 dark:text-slate-300',
  };

  return (
    <div className={cn("rounded-xl border-2 p-3", variantStyles[variant])}>
      <div className="flex items-center gap-2.5">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconStyles[variant])}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className={cn("text-sm font-bold font-mono truncate", textStyles[variant])} dir="ltr">
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-center">
      <p className={cn(
        "text-lg font-bold font-mono",
        variant === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
      )}>
        {isLoading ? '-' : value}
      </p>
      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  );
}
