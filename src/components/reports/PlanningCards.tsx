import { ChartPie, Target, Landmark, ChevronLeft, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, toPersianNum } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface PlanningCardProps {
  type: 'budget' | 'goals' | 'debts';
  stats: {
    total: number;
    current: number;
    percent: number;
    count: number;
    alertCount?: number;
  };
  onClick: () => void;
}

const cardConfig = {
  budget: {
    icon: ChartPie,
    title: 'بودجه ماهانه',
    emptyText: 'بودجه تعیین کنید',
    progressLabel: 'استفاده شده',
    alertLabel: 'دسته بیش از بودجه',
    color: 'chart-1',
    variant: 'budget' as const,
  },
  goals: {
    icon: Target,
    title: 'اهداف پس‌انداز',
    emptyText: 'هدف جدید بسازید',
    progressLabel: 'تکمیل شده',
    alertLabel: '',
    color: 'success',
    variant: 'savings' as const,
  },
  debts: {
    icon: Landmark,
    title: 'مدیریت بدهی',
    emptyText: 'بدون بدهی!',
    progressLabel: 'پرداخت شده',
    alertLabel: 'بدهی سررسید شده',
    color: 'warning',
    variant: 'debt' as const,
  },
};

export function PlanningCard({ type, stats, onClick }: PlanningCardProps) {
  const config = cardConfig[type];
  const Icon = config.icon;
  const hasData = stats.count > 0;
  const hasAlert = (stats.alertCount || 0) > 0;
  
  // For debts, show remaining amount as primary value
  const primaryValue = type === 'debts' 
    ? stats.total - stats.current 
    : stats.current;
  
  const secondaryValue = type === 'debts'
    ? stats.current // paid amount
    : stats.total - stats.current; // remaining

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-2xl bg-card border-2 transition-all duration-200 text-right",
        "hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        hasAlert 
          ? "border-destructive/30 hover:border-destructive/50" 
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Header Row */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
          hasAlert ? "bg-destructive/10" : `bg-${config.color}/10`
        )}>
          <Icon className={cn(
            "w-7 h-7",
            hasAlert ? "text-destructive" : `text-${config.color}`
          )} strokeWidth={2} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-foreground">{config.title}</h3>
            {hasAlert && (
              <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
            )}
          </div>
          
          {hasData ? (
            <>
              {/* Primary Value - Large and prominent */}
              <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                {formatCurrency(primaryValue).replace(' تومان', '')}
                <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
              </p>
              
              {/* Alert Badge */}
              {hasAlert && (
                <p className="text-xs text-destructive font-medium mt-1">
                  ⚠️ {toPersianNum(stats.alertCount || 0)} {config.alertLabel}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{config.emptyText}</p>
          )}
        </div>
        
        <ChevronLeft className="w-5 h-5 text-muted-foreground mt-2 shrink-0" />
      </div>
      
      {/* Progress Section */}
      {hasData && (
        <div className="space-y-2">
          <Progress 
            value={stats.percent} 
            size="md" 
            variant={config.variant}
          />
          
          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground tabular-nums">
              {toPersianNum(Math.round(stats.percent))}٪ {config.progressLabel}
            </span>
            <span className={cn(
              "font-medium tabular-nums",
              type === 'debts' ? "text-success" : "text-muted-foreground"
            )}>
              {type === 'debts' 
                ? `${formatCurrency(stats.current).replace(' تومان', '')} پرداخت شده`
                : `${formatCurrency(stats.total).replace(' تومان', '')} کل`
              }
            </span>
          </div>
        </div>
      )}
    </button>
  );
}

// Financial Health Summary Card
interface HealthSummaryProps {
  budgetPercent: number;
  goalsPercent: number;
  debtPercent: number;
  hasData: boolean;
}

export function FinancialHealthCard({ budgetPercent, goalsPercent, debtPercent, hasData }: HealthSummaryProps) {
  // Calculate overall health score (simplified)
  const healthScore = hasData 
    ? Math.round((100 - Math.min(budgetPercent, 100) + goalsPercent + debtPercent) / 3)
    : 0;
  
  const healthStatus = healthScore >= 70 ? 'excellent' : healthScore >= 50 ? 'good' : healthScore >= 30 ? 'fair' : 'needs-attention';
  
  const statusConfig = {
    'excellent': { label: 'عالی', color: 'text-success', bg: 'bg-success/10' },
    'good': { label: 'خوب', color: 'text-primary', bg: 'bg-primary/10' },
    'fair': { label: 'متوسط', color: 'text-warning', bg: 'bg-warning/10' },
    'needs-attention': { label: 'نیاز به توجه', color: 'text-destructive', bg: 'bg-destructive/10' },
  };
  
  const status = statusConfig[healthStatus];

  if (!hasData) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-card border-2 border-primary/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">سلامت مالی</h3>
            <p className="text-sm text-muted-foreground">
              با ثبت بودجه و اهداف، وضعیت مالی خود را ببینید
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border-2 border-primary/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">سلامت مالی</h3>
            <p className="text-xs text-muted-foreground">امتیاز کلی</p>
          </div>
        </div>
        
        <div className={cn("px-3 py-1.5 rounded-xl", status.bg)}>
          <span className={cn("text-sm font-bold", status.color)}>
            {status.label}
          </span>
        </div>
      </div>
      
      {/* Mini Progress Bars */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
            <div 
              className="h-full bg-chart-1 rounded-full transition-all"
              style={{ width: `${Math.min(100 - budgetPercent, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">بودجه</p>
        </div>
        <div className="text-center">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
            <div 
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${goalsPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">پس‌انداز</p>
        </div>
        <div className="text-center">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
            <div 
              className="h-full bg-warning rounded-full transition-all"
              style={{ width: `${debtPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">بدهی</p>
        </div>
      </div>
    </div>
  );
}
