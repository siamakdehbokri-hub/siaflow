import { BalanceCard } from './BalanceCard';
import { TransactionItem } from './TransactionItem';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { MonthlySummary } from './MonthlySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category, DashboardWidget } from '@/types/expense';
import { ChevronLeft, Calendar, Sparkles, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
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

  const balance = totalIncome - totalExpense;
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
        return (
          <div key={widget.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <SpendingChart categories={categories} />
          </div>
        );

      case 'trend-chart':
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onViewAllTransactions}
                className="text-primary text-sm group"
              >
                مشاهده همه
                <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              </Button>
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

  // Get greeting emoji
  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 17) return '☀️';
    if (hour >= 17 && hour < 21) return '🌆';
    return '🌙';
  };

  // Quick stats
  const todayTransactions = transactions.filter(t => t.date === today.slice(0, 10));
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Welcome Card - Enhanced */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-4 sm:p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Calendar className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              {getGreeting()}، {userName} 
              <span className="text-xl">{getGreetingEmoji()}</span>
            </p>
            <p className="text-sm text-muted-foreground">{formatPersianDateFull(today)}</p>
          </div>
        </div>
      </div>

      {/* Today's Quick Stats - New */}
      {(todayExpense > 0 || todayIncome > 0) && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          {todayIncome > 0 && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">درآمد امروز</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('fa-IR').format(todayIncome)} <span className="text-[10px] font-normal">ت</span>
                </p>
              </div>
            </div>
          )}
          {todayExpense > 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">هزینه امروز</p>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {new Intl.NumberFormat('fa-IR').format(todayExpense)} <span className="text-[10px] font-normal">ت</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Charts Grid - Responsive */}
      {chartWidgets.length > 0 && (
        <div className={cn(
          "grid gap-4 sm:gap-5",
          chartWidgets.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        )}>
          {chartWidgets.map((widget, index) => renderWidget(widget, index))}
        </div>
      )}

      {/* Other widgets */}
      {otherWidgets
        .filter(w => w.type !== 'balance')
        .map((widget, index) => renderWidget(widget, index + chartWidgets.length))}
    </div>
  );
}
