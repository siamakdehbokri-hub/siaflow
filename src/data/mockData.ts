import { Transaction, Category } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';

export const categories: Category[] = [
  { id: '1', name: 'خانه', icon: 'Home', color: 'hsl(25, 95%, 53%)', budget: 5000000, spent: 3500000, type: 'expense' },
  { id: '2', name: 'حمل و نقل', icon: 'Car', color: 'hsl(199, 89%, 48%)', budget: 3000000, spent: 1500000, type: 'expense' },
  { id: '3', name: 'خوراک و نوشیدنی', icon: 'UtensilsCrossed', color: 'hsl(38, 92%, 50%)', budget: 4000000, spent: 2100000, type: 'expense' },
  { id: '4', name: 'سرگرمی و تفریح', icon: 'Gamepad2', color: 'hsl(262, 83%, 58%)', budget: 2000000, spent: 600000, type: 'expense' },
  { id: '5', name: 'پوشاک و مد', icon: 'ShoppingBag', color: 'hsl(330, 80%, 60%)', budget: 2500000, spent: 800000, type: 'expense' },
  { id: '6', name: 'سلامت و بهداشت', icon: 'Heart', color: 'hsl(0, 72%, 51%)', budget: 2000000, spent: 500000, type: 'expense' },
  { id: '7', name: 'آموزش و توسعه فردی', icon: 'Book', color: 'hsl(168, 76%, 42%)', budget: 1500000, spent: 300000, type: 'expense' },
  { id: '8', name: 'بدهی و قسط', icon: 'Receipt', color: 'hsl(0, 60%, 45%)', budget: 3000000, spent: 2500000, type: 'expense' },
  { id: '9', name: 'سایر هزینه‌ها', icon: 'MoreHorizontal', color: 'hsl(220, 14%, 50%)', budget: 1000000, spent: 200000, type: 'expense' },
  { id: '10', name: 'حقوق و دستمزد', icon: 'Wallet', color: 'hsl(142, 71%, 45%)', type: 'income' },
  { id: '11', name: 'سرمایه‌گذاری و پس‌انداز', icon: 'TrendingUp', color: 'hsl(168, 76%, 42%)', type: 'income' },
  { id: '12', name: 'سایر درآمدها', icon: 'Gift', color: 'hsl(38, 92%, 50%)', type: 'income' },
];

export const transactions: Transaction[] = [
  { id: '1', amount: 150000, type: 'expense', category: 'خوراک و نوشیدنی', description: 'ناهار رستوران', date: '2024-01-15' },
  { id: '2', amount: 50000, type: 'expense', category: 'حمل و نقل', description: 'تاکسی', date: '2024-01-15' },
  { id: '3', amount: 25000000, type: 'income', category: 'حقوق و دستمزد', description: 'حقوق دی ماه', date: '2024-01-01' },
  { id: '4', amount: 800000, type: 'expense', category: 'پوشاک و مد', description: 'لباس زمستانی', date: '2024-01-14' },
  { id: '5', amount: 300000, type: 'expense', category: 'خانه', description: 'قبض برق', date: '2024-01-10', isRecurring: true },
  { id: '6', amount: 2000000, type: 'expense', category: 'سلامت و بهداشت', description: 'ویزیت دکتر', date: '2024-01-12' },
  { id: '7', amount: 120000, type: 'expense', category: 'سرگرمی و تفریح', description: 'سینما', date: '2024-01-13' },
  { id: '8', amount: 5000000, type: 'income', category: 'سرمایه‌گذاری و پس‌انداز', description: 'سود سهام', date: '2024-01-08' },
];

// Re-export formatCurrency from persianDate
export { formatCurrency };

// Legacy formatDate for backward compatibility - now uses Persian calendar
export { formatPersianDate as formatDate } from '@/utils/persianDate';
