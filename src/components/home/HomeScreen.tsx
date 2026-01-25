import { useMemo } from 'react';
import { Transaction, Category } from '@/types/expense';
import { isInCurrentJalaliMonth } from '@/utils/persianDate';
import { BalanceHero } from './BalanceHero';
import { QuickActions } from './QuickActions';
import { AIInsightCard } from './AIInsightCard';
import { RecentActivity } from './RecentActivity';

interface HomeScreenProps {
  transactions: Transaction[];
  categories: Category[];
  userName?: string;
  onAddTransaction: (type?: string) => void;
  onViewAllTransactions: () => void;
  onViewInsights: () => void;
  onOpenTransfers: () => void;
}

export function HomeScreen({
  transactions,
  categories,
  userName = 'کاربر',
  onAddTransaction,
  onViewAllTransactions,
  onViewInsights,
  onOpenTransfers,
}: HomeScreenProps) {
  // Calculate financial data for current Jalali month
  const financialData = useMemo(() => {
    const monthlyTransactions = transactions.filter(t => isInCurrentJalaliMonth(t.date));
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    
    // Get top spending category
    const categorySpending = categories
      .map(cat => ({
        name: cat.name,
        spent: monthlyTransactions
          .filter(t => t.type === 'expense' && t.category === cat.name)
          .reduce((sum, t) => sum + t.amount, 0)
      }))
      .filter(c => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
    
    const topCategory = categorySpending[0];
    
    return {
      income,
      expense,
      balance,
      savingsRate: Math.max(0, savingsRate),
      topCategory,
      recentTransactions: transactions.slice(0, 4),
    };
  }, [transactions, categories]);

  // Generate contextual AI insight
  const getInsight = () => {
    const { savingsRate, topCategory, expense, income } = financialData;
    
    if (income === 0 && expense === 0) {
      return {
        type: 'tip' as const,
        title: 'شروع کنید!',
        message: 'اولین تراکنش خود را ثبت کنید تا بینش‌های مالی شخصی دریافت کنید.',
      };
    }
    
    if (savingsRate >= 30) {
      return {
        type: 'achievement' as const,
        title: 'عالی! نرخ پس‌انداز بالا',
        message: `این ماه ${Math.round(savingsRate)}% از درآمدتان را پس‌انداز کرده‌اید. ادامه دهید!`,
      };
    }
    
    if (savingsRate < 10 && income > 0) {
      return {
        type: 'warning' as const,
        title: 'هشدار پس‌انداز',
        message: topCategory 
          ? `بیشترین هزینه شما در "${topCategory.name}" است. آیا می‌توان کاهش داد؟`
          : 'پیشنهاد می‌کنیم حداقل ۱۰٪ درآمد را پس‌انداز کنید.',
      };
    }
    
    return {
      type: 'tip' as const,
      title: 'وضعیت مالی متعادل',
      message: 'هزینه‌ها و درآمدتان در تعادل است. برای رشد بیشتر، اهداف پس‌انداز تعیین کنید.',
    };
  };

  const insight = getInsight();

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'transfer') {
      onOpenTransfers();
    } else {
      onAddTransaction(actionId);
    }
  };

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'روز بخیر';
    if (hour < 21) return 'عصر بخیر';
    return 'شب بخیر';
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="px-1 animate-fade-in">
        <h2 className="text-xl font-bold text-foreground">
          {getGreeting()}، {userName}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          خلاصه مالی این ماه شما
        </p>
      </div>
      
      {/* Balance Hero Card */}
      <BalanceHero
        balance={financialData.balance}
        income={financialData.income}
        expense={financialData.expense}
        savingsRate={financialData.savingsRate}
      />
      
      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />
      
      {/* AI Insight Highlight */}
      <AIInsightCard
        type={insight.type}
        title={insight.title}
        message={insight.message}
        onClick={onViewInsights}
      />
      
      {/* Recent Activity */}
      <RecentActivity
        transactions={financialData.recentTransactions}
        onViewAll={onViewAllTransactions}
      />
    </div>
  );
}
