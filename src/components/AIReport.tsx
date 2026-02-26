import { useState } from 'react';
import { Sparkles, TrendingUp, PiggyBank, Wallet, Loader2, RefreshCw, AlertCircle, Brain, ClipboardList, Lightbulb, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Category } from '@/types/expense';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIReportProps {
  transactions: Transaction[];
  categories: Category[];
}

type ReportType = 'summary' | 'savings' | 'budget' | 'tip';

const reportTypes = [
  { id: 'summary' as ReportType, label: 'خلاصه مالی', icon: TrendingUp },
  { id: 'savings' as ReportType, label: 'پیشنهاد صرفه‌جویی', icon: PiggyBank },
  { id: 'budget' as ReportType, label: 'تحلیل بودجه', icon: Wallet },
];

export function AIReport({ transactions, categories }: AIReportProps) {
  const [activeType, setActiveType] = useState<ReportType>('summary');
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTransactions = transactions.length > 0;
  const hasIncome = transactions.some(t => t.type === 'income');
  const hasExpenses = transactions.some(t => t.type === 'expense');

  const generateReport = async (type: ReportType) => {
    setActiveType(type);
    setLoading(true);
    setReport(null);
    setError(null);

    if (!hasTransactions) {
      setError('برای دریافت گزارش هوشمند، ابتدا تراکنش‌هایی ثبت کنید.');
      setLoading(false);
      return;
    }

    if (type === 'summary' && !hasIncome && !hasExpenses) {
      setError('حداقل یک تراکنش درآمد یا هزینه نیاز است.');
      setLoading(false);
      return;
    }

    if (type === 'savings' && !hasExpenses) {
      setError('برای پیشنهاد صرفه‌جویی، حداقل یک هزینه ثبت کنید.');
      setLoading(false);
      return;
    }

    if (type === 'budget') {
      const hasBudgetCategories = categories.some(c => c.budget && c.budget > 0);
      if (!hasBudgetCategories) {
        setError('ابتدا بودجه‌ای برای دسته‌بندی‌ها تعیین کنید.');
        setLoading(false);
        return;
      }
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ai-report', {
        body: { 
          transactions: transactions.slice(0, 150).map(t => ({
            amount: t.amount,
            type: t.type,
            category: t.category,
            subcategory: t.subcategory || null,
            description: t.description || '',
            date: t.date,
            tags: t.tags || [],
          })),
          categories,
          type 
        }
      });

      if (invokeError) {
        console.error('AI report invoke error:', invokeError);
        throw new Error(invokeError.message || 'خطا در ارتباط با سرور');
      }
      
      if (data?.error) {
        if (data.error.includes('محدودیت') || data.error.includes('429')) {
          setError('محدودیت درخواست. لطفاً چند دقیقه صبر کنید.');
          toast.error('محدودیت درخواست');
        } else if (data.error.includes('402') || data.error.includes('اعتبار')) {
          setError('اعتبار AI تمام شده است.');
          toast.error('اعتبار AI تمام شده');
        } else {
          setError(data.error);
          toast.error(data.error);
        }
        return;
      }

      if (!data?.report) {
        setError('پاسخی از AI دریافت نشد. لطفاً دوباره تلاش کنید.');
        return;
      }

      setReport(data.report);
    } catch (err: any) {
      console.error('AI report error:', err);
      setError('خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  // Empty state
  if (!hasTransactions) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-card border-2 border-border shadow-sm">
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
              <Bot className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">مشاور هوشمند مالی</h3>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">AI</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-inner">
              <ClipboardList className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">هنوز داده‌ای برای تحلیل نیست</p>
              <p className="text-xs text-muted-foreground">با ثبت تراکنش‌ها، گزارش هوشمند دریافت کنید</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border-2 border-border shadow-sm">
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-chart-5/5 blur-2xl" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-primary/20 to-chart-5/10 flex items-center justify-center shadow-sm border border-primary/10">
              <Bot className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center border-2 border-card">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">مشاور هوشمند مالی</h3>
            <p className="text-[11px] text-muted-foreground">تحلیل دقیق تک‌تک تراکنش‌ها</p>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {reportTypes.map((type) => {
            const isActive = activeType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => generateReport(type.id)}
                disabled={loading}
                className={cn(
                  "relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl" />
                )}
                <type.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-primary-foreground" : "text-muted-foreground")} strokeWidth={2} />
                <span className="relative z-10">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="min-h-[220px] relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center shadow-xl shadow-primary/30">
                  <span className="text-3xl animate-pulse"><Brain className="w-8 h-8 text-primary-foreground" strokeWidth={2} /></span>
                </div>
                <Loader2 className="absolute -right-1.5 -bottom-1.5 w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">در حال تحلیل عمیق...</p>
                <p className="text-xs text-muted-foreground">بررسی تک‌تک تراکنش‌ها</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center shadow-sm">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => generateReport(activeType)}
                  className="gap-2 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                  تلاش مجدد
                </Button>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="prose prose-sm max-w-none text-foreground leading-loose whitespace-pre-wrap text-sm">
                  {report}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateReport(activeType)}
                className="text-muted-foreground hover:text-primary rounded-xl"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحلیل مجدد
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-chart-5/5 flex items-center justify-center shadow-inner border border-primary/10">
                <Lightbulb className="w-10 h-10 text-primary/60" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">آماده تحلیل هوشمند</p>
                <p className="text-xs text-muted-foreground mb-3">یکی از بخش‌های بالا را انتخاب کنید</p>
                <Button onClick={() => generateReport('summary')} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                  <Sparkles className="w-4 h-4" />
                  شروع تحلیل
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}