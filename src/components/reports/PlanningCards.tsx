import { ChartPie, Target, Landmark, ChevronLeft, AlertTriangle, TrendingUp, Sparkles, Activity } from 'lucide-react';
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

  // Icon map for card types
  const iconMap = { budget: ChartPie, goals: Target, debts: Landmark };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden w-full p-5 rounded-2xl transition-all duration-200 text-right",
        "active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      style={{
        background: 'linear-gradient(145deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.4) 100%)',
        backdropFilter: 'blur(20px)',
        border: hasAlert ? '1px solid hsl(var(--destructive) / 0.3)' : '1px solid hsl(var(--border) / 0.4)',
      }}
    >
      {/* Decorative orb */}
      <div className={cn(
        "absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-30",
        hasAlert ? "bg-destructive" : `bg-${config.color}`
      )} />
      
      <div className="relative">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
            hasAlert 
              ? "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/10" 
              : `bg-gradient-to-br from-${config.color}/15 to-${config.color}/5 border-${config.color}/10`
          )}>
            {(() => { const CardIcon = iconMap[type]; return <CardIcon className="w-7 h-7 text-foreground" strokeWidth={2} />; })()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-black text-foreground">{config.title}</h3>
              {hasAlert && (
                <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
              )}
            </div>
            
            {hasData ? (
              <>
                <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                  {formatCurrency(primaryValue).replace(' تومان', '')}
                  <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
                </p>
                
                {hasAlert && (
                  <p className="text-xs text-destructive font-bold mt-1">
                    {toPersianNum(stats.alertCount || 0)} {config.alertLabel}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{config.emptyText}</p>
            )}
          </div>
          
          <ChevronLeft className="w-5 h-5 text-muted-foreground mt-2 shrink-0" strokeWidth={2} />
        </div>
        
        {/* Progress Section */}
        {hasData && (
          <div className="space-y-2">
            <Progress 
              value={stats.percent} 
              size="md" 
              variant={config.variant}
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground tabular-nums">
                {toPersianNum(Math.round(stats.percent))}٪ {config.progressLabel}
              </span>
              <span className={cn(
                "font-bold tabular-nums",
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
      </div>
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
  // Calculate overall health score using weighted average of ACTIVE dimensions only
  // budgetPercent = % used (lower is better) → score = 100 - used
  // goalsPercent = % saved toward target (higher is better)
  // debtPercent = % paid off (higher is better)
  
  const dimensions: { score: number; weight: number }[] = [];
  
  // Only include dimensions the user actually has data for
  if (budgetPercent > 0 || budgetPercent === 0) {
    // Budget: if user has budgets, score = how much is remaining
    // But we only add this if there's actual budget data (passed via hasData context)
    dimensions.push({ score: Math.max(0, 100 - Math.min(budgetPercent, 150)), weight: 1 });
  }
  if (goalsPercent > 0) {
    dimensions.push({ score: Math.min(goalsPercent, 100), weight: 1 });
  }
  if (debtPercent > 0) {
    dimensions.push({ score: Math.min(debtPercent, 100), weight: 1 });
  }
  
  // If no active dimensions, use a neutral score
  const healthScore = dimensions.length > 0
    ? Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / dimensions.reduce((sum, d) => sum + d.weight, 0))
    : 50;
  
  const healthStatus = healthScore >= 75 ? 'excellent' : healthScore >= 55 ? 'good' : healthScore >= 35 ? 'fair' : 'needs-attention';
  
  const statusConfig = {
    'excellent': { label: 'عالی', color: 'text-success', bg: 'bg-success/10' },
    'good': { label: 'خوب', color: 'text-primary', bg: 'bg-primary/10' },
    'fair': { label: 'متوسط', color: 'text-warning', bg: 'bg-warning/10' },
    'needs-attention': { label: 'نیاز به توجه', color: 'text-destructive', bg: 'bg-destructive/10' },
  };
  
  const status = statusConfig[healthStatus];

  // Compute display values for each bar
  const budgetBarValue = Math.max(0, Math.min(100 - budgetPercent, 100)); // remaining budget (higher = better)
  const goalsBarValue = Math.min(goalsPercent, 100);
  const debtBarValue = Math.min(debtPercent, 100);

  if (!hasData) {
    return (
      <div className="relative overflow-hidden p-6 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--card) / 0.6) 100%)',
          border: '1px solid hsl(var(--primary) / 0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">سلامت مالی</h3>
            <p className="text-sm text-muted-foreground">
              با ثبت بودجه و اهداف، وضعیت مالی خود را ببینید
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl"
      style={{
        background: 'linear-gradient(145deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.6) 100%)',
        border: '1px solid hsl(var(--primary) / 0.12)',
        backdropFilter: 'blur(20px)',
      }}
    >
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
              <Activity className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">سلامت مالی</h3>
              <p className="text-xs text-muted-foreground">امتیاز کلی</p>
            </div>
          </div>
          
          <div className={cn("px-3 py-1.5 rounded-xl shadow-sm", status.bg)}>
            <span className={cn("text-sm font-black", status.color)}>
              {status.label}
            </span>
          </div>
        </div>
        
        {/* Mini Progress Bars */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-xl" style={{ background: 'hsl(var(--card) / 0.5)', border: '1px solid hsl(var(--border) / 0.3)' }}>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
              <div 
                className={cn("h-full rounded-full transition-all", budgetPercent > 100 ? "bg-destructive" : "bg-chart-1")}
                style={{ width: `${budgetBarValue}%` }}
              />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground">بودجه</p>
            <p className="text-[9px] font-bold text-muted-foreground/70">{Math.round(budgetBarValue)}٪ باقی</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: 'hsl(var(--card) / 0.5)', border: '1px solid hsl(var(--border) / 0.3)' }}>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
              <div 
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${goalsBarValue}%` }}
              />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground">اهداف</p>
            <p className="text-[9px] font-bold text-muted-foreground/70">{Math.round(goalsBarValue)}٪ تکمیل</p>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: 'hsl(var(--card) / 0.5)', border: '1px solid hsl(var(--border) / 0.3)' }}>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
              <div 
                className="h-full bg-warning rounded-full transition-all"
                style={{ width: `${debtBarValue}%` }}
              />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground">بدهی</p>
            <p className="text-[9px] font-bold text-muted-foreground/70">{Math.round(debtBarValue)}٪ پرداخت</p>
          </div>
        </div>
      </div>
    </div>
  );
}
