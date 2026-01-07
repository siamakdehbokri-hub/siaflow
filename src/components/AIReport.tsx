import { useState } from 'react';
import { Sparkles, TrendingUp, PiggyBank, Wallet, Loader2, RefreshCw, Bot, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { id: 'summary' as ReportType, label: 'خلاصه مالی', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'savings' as ReportType, label: 'پیشنهاد صرفه‌جویی', icon: PiggyBank, color: 'text-emerald-500' },
  { id: 'budget' as ReportType, label: 'تحلیل بودجه', icon: Wallet, color: 'text-purple-500' },
];

export function AIReport({ transactions, categories }: AIReportProps) {
  const [activeType, setActiveType] = useState<ReportType>('summary');
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if there's enough data
  const hasTransactions = transactions.length > 0;
  const hasIncome = transactions.some(t => t.type === 'income');
  const hasExpenses = transactions.some(t => t.type === 'expense');

  const generateReport = async (type: ReportType) => {
    setActiveType(type);
    setLoading(true);
    setReport(null);
    setError(null);

    // Check data availability
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
          transactions: transactions.slice(0, 100), // Limit for API
          categories: categories.filter(c => c.budget && c.budget > 0),
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

  // Empty state when no transactions
  if (!hasTransactions) {
    return (
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            گزارش هوشمند AI
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              جدید
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                هنوز داده‌ای برای تحلیل نیست
              </p>
              <p className="text-xs text-muted-foreground">
                با ثبت تراکنش‌ها، گزارش هوشمند دریافت کنید
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          گزارش هوشمند AI
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            جدید
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Report Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isActive = activeType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => generateReport(type.id)}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="min-h-[200px] relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <Loader2 className="absolute -right-1 -bottom-1 w-5 h-5 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">در حال تحلیل...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => generateReport(activeType)}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  تلاش مجدد
                </Button>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-3">
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                {report}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateReport(activeType)}
                className="text-muted-foreground hover:text-primary"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحلیل مجدد
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary/50" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  با هوش مصنوعی، تحلیل مالی هوشمند دریافت کنید
                </p>
                <Button onClick={() => generateReport('summary')} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  شروع تحلیل
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
