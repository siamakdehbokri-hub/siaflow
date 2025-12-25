import { BalanceCard } from './BalanceCard';
import { TransactionItem } from './TransactionItem';
import { SpendingChart } from './SpendingChart';
import { TrendChart } from './TrendChart';
import { CategoryBudget } from './CategoryBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction, Category } from '@/types/expense';
import { ChevronLeft } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  onViewAllTransactions: () => void;
}

export function Dashboard({ transactions, categories, onViewAllTransactions }: DashboardProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const recentTransactions = transactions.slice(0, 4);
  const budgetCategories = categories.filter(c => c.budget);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Balance */}
      <BalanceCard 
        balance={balance}
        income={totalIncome}
        expense={totalExpense}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SpendingChart />
        <TrendChart />
      </div>

      {/* Budget Overview */}
      <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">وضعیت بودجه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budgetCategories.slice(0, 3).map((category) => (
            <CategoryBudget key={category.id} category={category} />
          ))}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">تراکنش‌های اخیر</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAllTransactions}
            className="text-primary"
          >
            مشاهده همه
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
