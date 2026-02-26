import { useState } from 'react';
import { Sparkles, TrendingUp, PieChart, Brain, ChevronLeft } from 'lucide-react';
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
  emoji: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick: () => void;
  badge?: string;
}

function InsightCard({ emoji, title, description, color, bgColor, borderColor, onClick, badge }: InsightCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-card border-2 transition-all duration-300",
        "hover:shadow-md active:scale-[0.98] text-right w-full",
        borderColor
      )}
    >
      <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full blur-lg opacity-30" />
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border", bgColor)}>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          {badge && (
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={2} />
    </button>
  );
}

export function InsightsHub({ transactions, categories }: InsightsHubProps) {
  const [activeView, setActiveView] = useState<InsightView>('overview');

  const BackButton = () => (
    <button
      onClick={() => setActiveView('overview')}
      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
    >
      <ChevronLeft className="w-4 h-4 rotate-180" strokeWidth={2} />
      بازگشت
    </button>
  );

  if (activeView === 'ai') {
    return (
      <div className="space-y-4 animate-fade-in">
        <BackButton />
        <AIReport transactions={transactions} categories={categories} />
      </div>
    );
  }

  if (activeView === 'trends') {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackButton />
        <div className="relative overflow-hidden rounded-3xl bg-card border-2 border-border p-5 shadow-sm">
          <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-2/15 to-chart-2/5 flex items-center justify-center shadow-sm border border-chart-2/10">
                <span className="text-lg">📈</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">روند هزینه‌ها</h3>
            </div>
            <TrendChart transactions={transactions} />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-card border-2 border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-5/15 to-chart-5/5 flex items-center justify-center shadow-sm border border-chart-5/10">
              <span className="text-lg">📉</span>
            </div>
            <h3 className="text-sm font-bold text-foreground">مقایسه ماهانه</h3>
          </div>
          <MonthlyComparisonChart transactions={transactions} />
        </div>
      </div>
    );
  }

  if (activeView === 'breakdown') {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackButton />
        <div className="relative overflow-hidden rounded-3xl bg-card border-2 border-border p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-chart-3/5 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-3/15 to-chart-3/5 flex items-center justify-center shadow-sm border border-chart-3/10">
                <span className="text-lg">🍰</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">تفکیک هزینه‌ها</h3>
            </div>
            <SpendingChart categories={categories} />
          </div>
        </div>
      </div>
    );
  }

  // Overview
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="px-1">
        <h2 className="text-xl font-black text-foreground">بینش‌ها و تحلیل</h2>
        <p className="text-sm text-muted-foreground mt-0.5">درک عمیق‌تر از رفتار مالی شما</p>
      </div>

      {/* AI Hero Card */}
      <button
        onClick={() => setActiveView('ai')}
        className="relative w-full overflow-hidden rounded-3xl text-right active:scale-[0.98] transition-all duration-300 group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl" />
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-white/10 rounded-3xl" />
        <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/8 blur-xl" />
        
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                <span className="text-3xl drop-shadow-md"><Brain className="w-8 h-8 text-white" strokeWidth={1.8} /></span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning/90 flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-white mb-1 drop-shadow-sm">تحلیل هوش مصنوعی</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                بررسی دقیق تک‌تک تراکنش‌ها و توصیه‌های شخصی
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/10">
                  تحلیل عمیق
                </span>
              </div>
            </div>
            <ChevronLeft className="w-6 h-6 text-white/70 mt-2 shrink-0 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
          </div>
        </div>
      </button>

      {/* More Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-muted-foreground px-1">تحلیل‌های بیشتر</h3>
        <InsightCard
          emoji="📈"
          title="روند هزینه‌ها"
          description="مشاهده تغییرات هزینه در طول زمان"
          color="text-chart-2"
          bgColor="bg-gradient-to-br from-chart-2/15 to-chart-2/5 border-chart-2/10"
          borderColor="border-border/40 hover:border-chart-2/30"
          onClick={() => setActiveView('trends')}
        />
        <InsightCard
          emoji="🍰"
          title="تفکیک دسته‌بندی"
          description="سهم هر دسته از کل هزینه‌ها"
          color="text-chart-3"
          bgColor="bg-gradient-to-br from-chart-3/15 to-chart-3/5 border-chart-3/10"
          borderColor="border-border/40 hover:border-chart-3/30"
          onClick={() => setActiveView('breakdown')}
        />
      </div>

      {/* Quick Preview */}
      {transactions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground px-1">نگاه سریع</h3>
          <div className="relative overflow-hidden p-4 rounded-2xl bg-card border-2 border-border/40 shadow-sm">
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-chart-3/5 blur-xl" />
            <div className="relative">
              <SpendingChart categories={categories} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
