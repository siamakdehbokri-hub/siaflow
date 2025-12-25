import { useState, useEffect } from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Dashboard } from '@/components/Dashboard';
import { TransactionsList } from '@/components/TransactionsList';
import { Reports } from '@/components/Reports';
import { Settings } from '@/components/Settings';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { transactions as mockTransactions, categories } from '@/data/mockData';
import { Transaction } from '@/types/expense';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'داشبورد';
      case 'transactions': return 'تراکنش‌ها';
      case 'reports': return 'گزارش‌ها';
      case 'settings': return 'تنظیمات';
      default: return 'داشبورد';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{getPageTitle()}</h1>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-5">
        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            categories={categories}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionsList transactions={transactions} />
        )}
        {activeTab === 'reports' && (
          <Reports categories={categories} />
        )}
        {activeTab === 'settings' && (
          <Settings />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};

export default Index;
