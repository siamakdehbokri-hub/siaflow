import { BalanceCard } from './BalanceCard';
import { TransactionItem } from './TransactionItem';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { CategoryBudget } from './CategoryBudget';
import { MonthlySummary } from './MonthlySummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category, DashboardWidget } from '@/types/expense';
import { ChevronLeft, Calendar } from 'lucide-react';
import { formatPersianDateFull } from '@/utils/persianDate';

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
  const budgetCategories = categories.filter(c => c.budget);

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
        // Budget widget removed per user request - charts are more useful
        return null;

      case 'recent-transactions':
        return (
          <Card key={widget.id} variant="glass" className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="pb-3 px-4 sm:px-5 flex-row items-center justify-between">
              <CardTitle className="text-base">تراکنش‌های اخیر</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onViewAllTransactions}
                className="text-primary text-sm"
              >
                مشاهده همه
                <ChevronLeft className="w-4 h-4 mr-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 px-4 sm:px-5">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  هنوز تراکنشی ثبت نشده
                </p>
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

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Welcome & Today's Date */}
      <div className="flex items-center gap-3 bg-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-foreground">
            {getGreeting()}، {userName} 👋
          </p>
          <p className="text-sm text-muted-foreground">{formatPersianDateFull(today)}</p>
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

      {/* Charts Grid - Responsive */}
      {chartWidgets.length > 0 && (
        <div className={`grid gap-4 sm:gap-5 ${chartWidgets.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
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
