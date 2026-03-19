import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav, NavTab } from '@/components/navigation/BottomNav';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppMenu } from '@/components/layout/AppMenu';
import { HomeScreen } from '@/components/home/HomeScreen';
import { useTransactions, useCategories } from '@/hooks/useData';
import { useSavingGoals } from '@/hooks/useSavingGoals';
import { useDebts } from '@/hooks/useDebts';
import { useAutoSavings } from '@/hooks/useAutoSavings';
import { useAuth } from '@/hooks/useAuth';
import { useReminders } from '@/hooks/useReminders';
import { useDebtReminders } from '@/hooks/useDebtReminders';
import { Transaction } from '@/types/expense';
import { supabase } from '@/integrations/supabase/client';
import { isInCurrentJalaliMonth } from '@/utils/persianDate';
import { Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lazyRetryNamed } from '@/lib/lazyRetry';

// Lazy load heavy components with retry logic
const ReportsHub = lazy(() => lazyRetryNamed(() => import('@/components/reports/ReportsHub'), 'ReportsHub'));
const Settings = lazy(() => lazyRetryNamed(() => import('@/components/Settings'), 'Settings'));
const CategoryManagement = lazy(() => lazyRetryNamed(() => import('@/components/CategoryManagement'), 'CategoryManagement'));
const AddTransactionModal = lazy(() => lazyRetryNamed(() => import('@/components/AddTransactionModal'), 'AddTransactionModal'));
const EditTransactionModal = lazy(() => lazyRetryNamed(() => import('@/components/EditTransactionModal'), 'EditTransactionModal'));
const SavingGoals = lazy(() => lazyRetryNamed(() => import('@/components/SavingGoals'), 'SavingGoals'));
const DebtManagement = lazy(() => lazyRetryNamed(() => import('@/components/DebtManagement'), 'DebtManagement'));
const TransferManagement = lazy(() => lazyRetryNamed(() => import('@/components/TransferManagement'), 'TransferManagement'));
const AutoSavingsSheet = lazy(() => lazyRetryNamed(() => import('@/components/home/AutoSavingsSheet'), 'AutoSavingsSheet'));
const HelpGuide = lazy(() => lazyRetryNamed(() => import('@/components/HelpGuide'), 'HelpGuide'));

type SubView = 'main' | 'categories' | 'goals' | 'debts' | 'transfers' | 'help';

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [subView, setSubView] = useState<SubView>('main');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTransactionType, setAddTransactionType] = useState<string | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  // Fetch display_name from profiles table
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setProfileName(data.display_name);
      });
  }, [user?.id]);
  const { transactions, loading: transactionsLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { goals, loading: goalsLoading, addGoal, updateGoalAmount, deleteGoal } = useSavingGoals();
  const { debts, loading: debtsLoading, addDebt, updateDebt, deleteDebt, addPayment, stats: debtStats } = useDebts();
  const { reminders, dismissReminder } = useReminders(transactions);
  const { reminders: debtReminders, dismissReminder: dismissDebtReminder, requestNotificationPermission } = useDebtReminders(debts);
  const { suggestion: autoSavingsSuggestion, shouldShow: showAutoSavings, prefs: autoSavingsPrefs, acceptSuggestion, declineSuggestion, enableAutoTransfer } = useAutoSavings(transactions);
  const [autoSavingsOpen, setAutoSavingsOpen] = useState(false);
  const categoriesWithSpent = useMemo(() => {
    // Pre-compute spending map in a single pass over transactions
    const spendingMap = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === 'expense' && isInCurrentJalaliMonth(t.date)) {
        spendingMap.set(t.category, (spendingMap.get(t.category) || 0) + t.amount);
      }
    }
    return categories.map(category => ({
      ...category,
      spent: spendingMap.get(category.name) || 0,
    }));
  }, [categories, transactions]);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
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
    if (subView === 'help') return 'راهنمای استفاده';
    switch (activeTab) {
      case 'home': return 'داشبورد';
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient background blobs for glassmorphism */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ top: '-80px', right: '-60px', width: '340px', height: '340px', background: 'rgba(90,68,200,0.24)', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ bottom: '-60px', left: '-50px', width: '280px', height: '280px', background: 'rgba(18,108,92,0.18)', filter: 'blur(80px)' }} />
      </div>
      {/* Header */}
      <AppHeader
        title={getPageTitle()} 
        onMenuClick={() => setIsMenuOpen(true)}
        debtReminders={debtReminders}
        reminders={reminders}
        onDismissDebtReminder={dismissDebtReminder}
        onDismissReminder={dismissReminder}
        onEnableNotifications={requestNotificationPermission}
      />

      {/* Side Menu */}
      <AppMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={setSubView}
        onTabChange={handleTabChange}
        onOpenAdmin={() => navigate('/admin')}
        onOpenHelp={() => {
          setSubView('help');
          setIsMenuOpen(false);
        }}
      />

      {/* Sub-view back button */}
      {subView !== 'main' && (
        <div className="bg-card border-b border-border px-4 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSubView('main')} 
            className="gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            بازگشت
          </Button>
        </div>
      )}

      {/* Notification badges - moved to header */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
          {subView === 'categories' ? (
            <CategoryManagement 
              categories={categoriesWithSpent} 
              onAddCategory={addCategory} 
              onEditCategory={updateCategory} 
              onDeleteCategory={deleteCategory} 
            />
          ) : subView === 'goals' ? (
            <SavingGoals 
              goals={goals} 
              onAddGoal={addGoal} 
              onUpdateAmount={updateGoalAmount} 
              onDeleteGoal={deleteGoal} 
            />
          ) : subView === 'debts' ? (
            <DebtManagement 
              debts={debts} 
              stats={debtStats} 
              onAddDebt={addDebt} 
              onUpdateDebt={updateDebt} 
              onDeleteDebt={deleteDebt} 
              onAddPayment={addPayment} 
            />
          ) : subView === 'transfers' ? (
            <TransferManagement 
              goals={goals} 
              onTransferToGoal={async (goalId, amount) => { await updateGoalAmount(goalId, amount, 'deposit', 'انتقال از حساب'); }} 
            />
          ) : subView === 'help' ? (
            <HelpGuide onBack={() => setSubView('main')} />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  transactions={transactions}
                  categories={categoriesWithSpent}
                  userName={profileName || user?.user_metadata?.display_name || 'کاربر'}
                  onAddTransaction={openAddModal}
                  onViewAllTransactions={() => setActiveTab('reports')}
                  onOpenDebts={() => setSubView('debts')}
                  onOpenBudget={() => setSubView('categories')}
                  showAutoSavings={showAutoSavings}
                  onOpenAutoSavings={() => setAutoSavingsOpen(true)}
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
          </Suspense>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onAddClick={() => openAddModal()} 
      />

      {/* Modals - lazy loaded */}
      <Suspense fallback={null}>
        <AddTransactionModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddTransaction} 
          categories={categoriesWithSpent} 
        />
        <EditTransactionModal 
          isOpen={!!editingTransaction} 
          transaction={editingTransaction} 
          onClose={() => setEditingTransaction(null)} 
          onSave={updateTransaction} 
          onDelete={deleteTransaction} 
          categories={categoriesWithSpent} 
        />
        {autoSavingsSuggestion && (
          <AutoSavingsSheet
            open={autoSavingsOpen}
            onClose={() => setAutoSavingsOpen(false)}
            suggestion={autoSavingsSuggestion}
            prefs={autoSavingsPrefs}
            onAccept={(amount) => {
              acceptSuggestion(amount);
              addTransaction({
                amount,
                type: 'saving',
                category: 'پس‌انداز و سرمایه‌گذاری',
                description: 'پس‌انداز خودکار پایان ماه',
                date: new Date().toISOString().split('T')[0],
                tags: ['auto-savings'],
              });
            }}
            onDecline={declineSuggestion}
            onEnableAuto={enableAutoTransfer}
          />
        )}
      </Suspense>
    </div>
  );
};

export default Index;
