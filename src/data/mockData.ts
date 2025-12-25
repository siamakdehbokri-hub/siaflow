import { Transaction, Category } from '@/types/expense';

export const categories: Category[] = [
  { id: '1', name: 'غذا و رستوران', icon: 'UtensilsCrossed', color: 'hsl(38, 92%, 50%)', budget: 3000000, spent: 2100000 },
  { id: '2', name: 'حمل و نقل', icon: 'Car', color: 'hsl(199, 89%, 48%)', budget: 2000000, spent: 1500000 },
  { id: '3', name: 'خرید', icon: 'ShoppingBag', color: 'hsl(262, 83%, 58%)', budget: 5000000, spent: 4200000 },
  { id: '4', name: 'قبوض', icon: 'Receipt', color: 'hsl(0, 72%, 51%)', budget: 1500000, spent: 1400000 },
  { id: '5', name: 'سلامت', icon: 'Heart', color: 'hsl(142, 71%, 45%)', budget: 2000000, spent: 800000 },
  { id: '6', name: 'تفریح', icon: 'Gamepad2', color: 'hsl(168, 76%, 42%)', budget: 1000000, spent: 600000 },
  { id: '7', name: 'حقوق', icon: 'Wallet', color: 'hsl(142, 71%, 45%)' },
  { id: '8', name: 'سرمایه‌گذاری', icon: 'TrendingUp', color: 'hsl(168, 76%, 42%)' },
];

export const transactions: Transaction[] = [
  { id: '1', amount: 150000, type: 'expense', category: 'غذا و رستوران', description: 'ناهار رستوران', date: '2024-01-15' },
  { id: '2', amount: 50000, type: 'expense', category: 'حمل و نقل', description: 'تاکسی', date: '2024-01-15' },
  { id: '3', amount: 25000000, type: 'income', category: 'حقوق', description: 'حقوق دی ماه', date: '2024-01-01' },
  { id: '4', amount: 800000, type: 'expense', category: 'خرید', description: 'لباس زمستانی', date: '2024-01-14' },
  { id: '5', amount: 300000, type: 'expense', category: 'قبوض', description: 'قبض برق', date: '2024-01-10', isRecurring: true },
  { id: '6', amount: 2000000, type: 'expense', category: 'سلامت', description: 'ویزیت دکتر', date: '2024-01-12' },
  { id: '7', amount: 120000, type: 'expense', category: 'تفریح', description: 'سینما', date: '2024-01-13' },
  { id: '8', amount: 5000000, type: 'income', category: 'سرمایه‌گذاری', description: 'سود سهام', date: '2024-01-08' },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
