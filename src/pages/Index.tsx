import { useState, useMemo } from 'react';
import { BottomNav, NavTab } from '@/components/navigation/BottomNav';
import { HomeScreen } from '@/components/home/HomeScreen';
import { ReportsHub } from '@/components/reports/ReportsHub';
import { Settings } from '@/components/Settings';
import { CategoryManagement } from '@/components/CategoryManagement';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { DebtReminderNotifications } from '@/components/DebtReminderNotifications';
import { SavingGoals } from '@/components/SavingGoals';
import { DebtManagement } from '@/components/DebtManagement';
import { TransferManagement } from '@/components/TransferManagement';
import { useTransactions, useCategories } from '@/hooks/useData';
import { useSavingGoals } from '@/hooks/useSavingGoals';
import { useDebts } from '@/hooks/useDebts';
import { useAuth } from '@/hooks/useAuth';
import { useReminders } from '@/hooks/useReminders';
import { useDebtReminders } from '@/hooks/useDebtReminders';
import { Transaction, Category } from '@/types/expense';
import { isInCurrentJalaliMonth } from '@/utils/persianDate';
import { Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SubView = 'main' | 'categories' | 'goals' | 'debts' | 'transfers';

const Index = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [subView, setSubView] = useState<SubView>('main');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTransactionType, setAddTransactionType] = useState<string | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const { user } = useAuth();
  const { transactions, loading: transactionsLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { goals, loading: goalsLoading, addGoal, updateGoalAmount, deleteGoal } = useSavingGoals();
  const { debts, loading: debtsLoading, addDebt, updateDebt, deleteDebt, addPayment, stats: debtStats } = useDebts();
  const { reminders, dismissReminder } = useReminders(transactions);
  const { reminders: debtReminders, dismissReminder: dismissDebtReminder, requestNotificationPermission } = useDebtReminders(debts);

  const categoriesWithSpent = useMemo(() => {
    return categories.map(category => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === category.name && isInCurrentJalaliMonth(t.date))
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...category, spent };
    });
  }, [categories, transactions]);

  const handleAddTransaction = async (transaction: any) => {
    await addTransaction({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      date: transaction.date,
      isRecurring: transaction.isRecurring,
      tags: transaction.tags,
    });
  };

  const openAddModal = (type?: string) => {
    setAddTransactionType(type);
    setIsAddModalOpen(true);
  };

  const handleTabChange = (tab: NavTab) => {
    setSubView('main');
    setActiveTab(tab);
  };

  const getPageTitle = () => {
    if (subView === 'categories') return 'دسته‌بندی‌ها';
    if (subView === 'goals') return 'اهداف پس‌انداز';
    if (subView === 'debts') return 'مدیریت بدهی';
    if (subView === 'transfers') return 'انتقال پول';
    switch (activeTab) {
      case 'home': return 'خانه';
      case 'reports': return 'گزارش‌ها';
      case 'settings': return 'تنظیمات';
      default: return 'SiaFlow';
    }
  };

  const isLoading = transactionsLoading || categoriesLoading || goalsLoading || debtsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/20" />
        <div className="relative max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subView !== 'main' && (
              <Button variant="ghost" size="icon" onClick={() => setSubView('main')} className="rounded-xl">
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">SF</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-1">
            <DebtReminderNotifications reminders={debtReminders} onDismiss={dismissDebtReminder} onEnableNotifications={requestNotificationPermission} />
            <ReminderNotifications reminders={reminders} onDismiss={dismissReminder} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        {subView === 'categories' ? (
          <CategoryManagement categories={categoriesWithSpent} onAddCategory={addCategory} onEditCategory={updateCategory} onDeleteCategory={deleteCategory} />
        ) : subView === 'goals' ? (
          <SavingGoals goals={goals} onAddGoal={addGoal} onUpdateAmount={updateGoalAmount} onDeleteGoal={deleteGoal} />
        ) : subView === 'debts' ? (
          <DebtManagement debts={debts} stats={debtStats} onAddDebt={addDebt} onUpdateDebt={updateDebt} onDeleteDebt={deleteDebt} onAddPayment={addPayment} />
        ) : subView === 'transfers' ? (
          <TransferManagement goals={goals} onTransferToGoal={async (goalId, amount) => await updateGoalAmount(goalId, amount, 'deposit', 'انتقال از حساب')} />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                transactions={transactions}
                categories={categoriesWithSpent}
                userName={user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر'}
                onAddTransaction={openAddModal}
                onViewAllTransactions={() => setActiveTab('reports')}
              />
            )}
            {activeTab === 'reports' && (
              <ReportsHub
                transactions={transactions}
                categories={categoriesWithSpent}
                goals={goals}
                debts={debts}
                onEditTransaction={setEditingTransaction}
                onDeleteTransaction={deleteTransaction}
                onOpenGoals={() => setSubView('goals')}
                onOpenDebts={() => setSubView('debts')}
                onOpenBudget={() => setSubView('categories')}
              />
            )}
            {activeTab === 'settings' && (
              <Settings onOpenCategories={() => setSubView('categories')} />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onAddClick={() => openAddModal()} />

      {/* Modals */}
      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddTransaction} categories={categoriesWithSpent} />
      <EditTransactionModal isOpen={!!editingTransaction} transaction={editingTransaction} onClose={() => setEditingTransaction(null)} onSave={updateTransaction} onDelete={deleteTransaction} categories={categoriesWithSpent} />
    </div>
  );
};

export default Index;
