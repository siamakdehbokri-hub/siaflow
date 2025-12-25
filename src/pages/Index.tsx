import { useState, useEffect } from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Dashboard } from '@/components/Dashboard';
import { TransactionsList } from '@/components/TransactionsList';
import { Reports } from '@/components/Reports';
import { Settings } from '@/components/Settings';
import { CategoryManagement } from '@/components/CategoryManagement';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { EditTransactionModal } from '@/components/EditTransactionModal';
import { transactions as mockTransactions, categories as mockCategories } from '@/data/mockData';
import { Transaction, Category } from '@/types/expense';
import { Bell, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    toast.success('تراکنش با موفقیت ثبت شد');
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    toast.success('تراکنش با موفقیت ویرایش شد');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast.success('تراکنش با موفقیت حذف شد');
  };

  const handleAddCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const handleEditCategory = (updatedCategory: Category) => {
    setCategories(categories.map(c => 
      c.id === updatedCategory.id ? updatedCategory : c
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const getPageTitle = () => {
    if (showCategories) return 'دسته‌بندی‌ها';
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
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">{getPageTitle()}</h1>
          <div className="flex items-center gap-1 sm:gap-2">
            {activeTab === 'settings' && !showCategories && (
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={() => setShowCategories(true)}
              >
                <FolderOpen className="w-5 h-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        {showCategories ? (
          <CategoryManagement 
            categories={categories}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                transactions={transactions} 
                categories={categories}
                onViewAllTransactions={() => handleTabChange('transactions')}
              />
            )}
            {activeTab === 'transactions' && (
              <TransactionsList 
                transactions={transactions}
                categories={categories}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}
            {activeTab === 'reports' && (
              <Reports 
                categories={categories}
                transactions={transactions}
              />
            )}
            {activeTab === 'settings' && (
              <Settings />
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
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};

export default Index;
