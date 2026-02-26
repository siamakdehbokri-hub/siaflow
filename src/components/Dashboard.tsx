import { BalanceCard } from './BalanceCard';
import { TransactionItem } from './TransactionItem';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { MonthlySummary } from './MonthlySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category, DashboardWidget } from '@/types/expense';
import { ChevronLeft, Calendar, Sparkles, Zap } from 'lucide-react';
import { formatPersianDateFull } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  widgets: DashboardWidget[];
  userName: string;
  onViewAllTransactions: () => void;
}

export function Dashboard({ transactions, categories, widgets, userName, onViewAllTransactions }: DashboardProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaving = transactions
    .filter(t => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense - totalSaving;
  const recentTransactions = transactions.slice(0, 4);

  const renderWidget = (widget: DashboardWidget, index: number) => {
    if (!widget.enabled) return null;

    switch (widget.type) {
      case 'balance':
        return (
          <BalanceCard 
            key={widget.id}
            balance={balance}
            income={totalIncome}
            expense={totalExpense}
          />
        );

      case 'spending-chart':
        // Only show if there are expenses
        if (totalExpense === 0) return null;
        return (
          <div key={widget.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <SpendingChart categories={categories} />
          </div>
        );

      case 'trend-chart':
        // Only show if there are transactions
        if (transactions.length === 0) return null;
        return (
          <div key={widget.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <TrendChart transactions={transactions} />
          </div>
        );

      case 'budget':
        return null;

      case 'recent-transactions':
        return (
          <Card key={widget.id} variant="glass" className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="pb-3 px-4 sm:px-5 flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                تراکنش‌های اخیر
              </CardTitle>
              {recentTransactions.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewAllTransactions}
                  className="text-primary text-sm group"
                >
                  مشاهده همه
                  <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2 px-4 sm:px-5">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    هنوز تراکنشی ثبت نشده
                  </p>
                  <p className="text-muted-foreground/70 text-xs mt-1">
                    با دکمه + اولین تراکنش را اضافه کنید
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Group charts together for grid layout
  const chartWidgets = widgets.filter(w => 
    (w.type === 'spending-chart' || w.type === 'trend-chart') && w.enabled
  );
  const otherWidgets = widgets.filter(w => 
    w.type !== 'spending-chart' && w.type !== 'trend-chart'
  );

  const today = new Date().toISOString();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'صبح بخیر';
    if (hour >= 12 && hour < 17) return 'ظهر بخیر';
    if (hour >= 17 && hour < 21) return 'عصر بخیر';
    return 'شب بخیر';
  };

  // Greeting removed - no emojis needed

  // Filter chart widgets that should actually show
  const visibleChartWidgets = chartWidgets.filter(w => {
    if (w.type === 'spending-chart' && totalExpense === 0) return false;
    if (w.type === 'trend-chart' && transactions.length === 0) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Welcome Card - Simplified */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              {getGreeting()}، {userName}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">{formatPersianDateFull(today)}</p>
          </div>
        </div>
      </div>

      {/* Render balance first if enabled */}
      {widgets.find(w => w.type === 'balance' && w.enabled) && (
        <BalanceCard 
          balance={balance}
          income={totalIncome}
          expense={totalExpense}
        />
      )}

      {/* Monthly Summary - Always show */}
      <MonthlySummary transactions={transactions} categories={categories} />

      {/* Charts Grid - Responsive - Only show if there's data */}
      {visibleChartWidgets.length > 0 && (
        <div className={cn(
          "grid gap-4 sm:gap-5",
          visibleChartWidgets.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        )}>
          {visibleChartWidgets.map((widget, index) => renderWidget(widget, index))}
        </div>
      )}

      {/* Other widgets */}
      {otherWidgets
        .filter(w => w.type !== 'balance')
        .map((widget, index) => renderWidget(widget, index + chartWidgets.length))}
    </div>
  );
}
