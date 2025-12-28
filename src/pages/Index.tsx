import { useState, useEffect, useMemo } from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Dashboard } from '@/components/Dashboard';
import { TransactionsList } from '@/components/TransactionsList';
import { Reports } from '@/components/Reports';
import { Settings } from '@/components/Settings';
import { CategoryManagement } from '@/components/CategoryManagement';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { SavingGoals } from '@/components/SavingGoals';
import { MonthlyAnalysis } from '@/components/MonthlyAnalysis';
import { useTransactions, useCategories } from '@/hooks/useData';
import { useSavingGoals } from '@/hooks/useSavingGoals';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { useReminders } from '@/hooks/useReminders';
import { Transaction, Category } from '@/types/expense';
import { FolderOpen, Loader2, PiggyBank, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showSavingGoals, setShowSavingGoals] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const { user } = useAuth();
  const { widgets, toggleWidget, moveWidget, resetWidgets } = useDashboardWidgets();
  const { 
    transactions, 
    loading: transactionsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction 
  } = useTransactions();
  
  const { 
    categories, 
    loading: categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory 
  } = useCategories();

  const {
    goals,
    loading: goalsLoading,
    addGoal,
    updateGoalAmount,
    deleteGoal,
  } = useSavingGoals();

  const { reminders, dismissReminder, hasReminders } = useReminders(transactions);

  // Calculate spent amounts for each category
  const categoriesWithSpent = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    return categories.map(category => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === category.name &&
          t.date.startsWith(currentMonth)
        )
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

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveTransaction = async (updated: Transaction) => {
    await updateTransaction(updated);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setEditingTransaction(null);
  };

  const handleAddCategory = async (category: Category) => {
    await addCategory({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget,
      type: category.budget ? 'expense' : 'income',
      subcategories: category.subcategories,
    });
  };

  const handleEditCategory = async (category: Category) => {
    await updateCategory(category);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const getPageTitle = () => {
    if (showCategories) return 'دسته‌بندی‌ها';
    if (showSavingGoals) return 'اهداف پس‌انداز';
    if (showAnalysis) return 'تحلیل ماهانه';
    switch (activeTab) {
      case 'dashboard': return 'داشبورد';
      case 'transactions': return 'تراکنش‌ها';
      case 'reports': return 'گزارش‌ها';
      case 'settings': return 'تنظیمات';
      default: return 'داشبورد';
    }
  };

  const handleTabChange = (tab: string) => {
    setShowCategories(false);
    setShowSavingGoals(false);
    setShowAnalysis(false);
    setActiveTab(tab);
  };

  const isLoading = transactionsLoading || categoriesLoading || goalsLoading;

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
    <div className="min-h-screen gradient-mesh pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-heavy border-b-0">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <span className="text-sm font-bold text-primary-foreground">SF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{getPageTitle()}</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">SiaFlow v1.7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'dashboard' && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={() => {
                    setShowSavingGoals(true);
                    setShowCategories(false);
                    setShowAnalysis(false);
                  }}
                  className="hover:bg-primary/10"
                  title="اهداف پس‌انداز"
                >
                  <PiggyBank className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={() => {
                    setShowAnalysis(true);
                    setShowCategories(false);
                    setShowSavingGoals(false);
                  }}
                  className="hover:bg-primary/10"
                  title="تحلیل ماهانه"
                >
                  <BarChart3 className="w-5 h-5" />
                </Button>
                <WidgetSettings
                  widgets={widgets}
                  onToggle={toggleWidget}
                  onMove={moveWidget}
                  onReset={resetWidgets}
                />
              </>
            )}
            {activeTab === 'settings' && !showCategories && (
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={() => setShowCategories(true)}
                className="hover:bg-primary/10"
              >
                <FolderOpen className="w-5 h-5" />
              </Button>
            )}
            <ReminderNotifications 
              reminders={reminders}
              onDismiss={dismissReminder}
            />
          </div>
        </div>
      </header>

      {/* Main Content with Page Transitions */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        {showCategories ? (
          <div key="categories" className="animate-slide-up">
            <CategoryManagement 
              categories={categoriesWithSpent}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          </div>
        ) : showSavingGoals ? (
          <div key="saving-goals" className="animate-slide-up">
            <SavingGoals 
              goals={goals}
              onAddGoal={addGoal}
              onUpdateAmount={updateGoalAmount}
              onDeleteGoal={deleteGoal}
            />
          </div>
        ) : showAnalysis ? (
          <div key="analysis" className="animate-slide-up">
            <MonthlyAnalysis 
              transactions={transactions}
              categories={categoriesWithSpent}
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div key="dashboard" className="animate-fade-in">
                <Dashboard 
                  transactions={transactions} 
                  categories={categoriesWithSpent}
                  widgets={widgets}
                  userName={user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'کاربر'}
                  onViewAllTransactions={() => handleTabChange('transactions')}
                />
              </div>
            )}
            {activeTab === 'transactions' && (
              <div key="transactions" className="animate-slide-up">
                <TransactionsList 
                  transactions={transactions}
                  categories={categoriesWithSpent}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            )}
            {activeTab === 'reports' && (
              <div key="reports" className="animate-slide-up">
                <Reports 
                  categories={categoriesWithSpent}
                  transactions={transactions}
                />
              </div>
            )}
            {activeTab === 'settings' && (
              <div key="settings" className="animate-fade-in">
                <Settings onOpenCategories={() => setShowCategories(true)} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
        categories={categoriesWithSpent}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        categories={categoriesWithSpent}
      />
    </div>
  );
};

export default Index;