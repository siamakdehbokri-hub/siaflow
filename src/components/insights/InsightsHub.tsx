import { useState } from 'react';
import { Sparkles, BarChart3, TrendingUp, PieChart, Brain, ChevronLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Transaction } from '@/types/expense';
import { AIReport } from '@/components/AIReport';
import { SpendingChart } from '@/components/SpendingChart';
import { TrendChart } from '@/components/TrendChart';
import { MonthlyComparisonChart } from '@/components/MonthlyComparisonChart';

type InsightView = 'overview' | 'ai' | 'trends' | 'breakdown';

interface InsightsHubProps {
  transactions: Transaction[];
  categories: Category[];
}

interface InsightCardProps {
  icon: typeof Sparkles;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onClick: () => void;
  badge?: string;
}

function InsightCard({ icon: Icon, title, description, color, bgColor, onClick, badge }: InsightCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-md active:scale-[0.98] text-right w-full"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bgColor)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {badge && (
            <span className="text-[9px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}

export function InsightsHub({ transactions, categories }: InsightsHubProps) {
  const [activeView, setActiveView] = useState<InsightView>('overview');

  // Back button for sub-views
  const BackButton = () => (
    <button
      onClick={() => setActiveView('overview')}
      className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
    >
      <ChevronLeft className="w-4 h-4 rotate-180" />
      بازگشت
    </button>
  );

  // AI Report View
  if (activeView === 'ai') {
    return (
      <div className="space-y-4 animate-fade-in">
        <BackButton />
        <AIReport transactions={transactions} categories={categories} />
      </div>
    );
  }

  // Trends View
  if (activeView === 'trends') {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackButton />
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">روند هزینه‌ها</h3>
          <TrendChart transactions={transactions} />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">مقایسه ماهانه</h3>
          <MonthlyComparisonChart transactions={transactions} />
        </div>
      </div>
    );
  }

  // Breakdown View
  if (activeView === 'breakdown') {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackButton />
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">تفکیک هزینه‌ها</h3>
          <SpendingChart categories={categories} />
        </div>
      </div>
    );
  }

  // Overview (default)
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-foreground">بینش‌ها و تحلیل</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          درک عمیق‌تر از رفتار مالی شما
        </p>
      </div>

      {/* AI Insights - Featured */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-card border border-primary/20">
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
        
        <button
          onClick={() => setActiveView('ai')}
          className="relative w-full text-right"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-foreground">تحلیل هوش مصنوعی</h3>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">
                گزارش شخصی‌سازی شده از وضعیت مالی شما با توصیه‌های هوشمند
              </p>
            </div>
            <ChevronLeft className="w-5 h-5 text-primary shrink-0 mt-2" />
          </div>
        </button>
      </div>

      {/* Other Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">تحلیل‌های بیشتر</h3>
        
        <InsightCard
          icon={TrendingUp}
          title="روند هزینه‌ها"
          description="مشاهده تغییرات هزینه در طول زمان"
          color="text-chart-2"
          bgColor="bg-chart-2/10"
          onClick={() => setActiveView('trends')}
        />
        
        <InsightCard
          icon={PieChart}
          title="تفکیک دسته‌بندی"
          description="سهم هر دسته از کل هزینه‌ها"
          color="text-chart-3"
          bgColor="bg-chart-3/10"
          onClick={() => setActiveView('breakdown')}
        />
      </div>

      {/* Quick Stats Preview */}
      {transactions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-1">نگاه سریع</h3>
          <div className="p-4 rounded-2xl bg-card border border-border/30">
            <SpendingChart categories={categories} />
          </div>
        </div>
      )}
    </div>
  );
}
