export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  reminderDays?: number; // Days before to remind
  nextDueDate?: string; // For recurring transactions
  tags?: string[]; // Tags for filtering
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  spent?: number;
  type?: 'expense' | 'income';
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  month: string;
}

export type WidgetType = 'balance' | 'spending-chart' | 'trend-chart' | 'budget' | 'recent-transactions';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  order: number;
}

export const defaultWidgets: DashboardWidget[] = [
  { id: 'balance', type: 'balance', title: 'موجودی', enabled: true, order: 0 },
  { id: 'spending-chart', type: 'spending-chart', title: 'نمودار هزینه‌ها', enabled: true, order: 1 },
  { id: 'trend-chart', type: 'trend-chart', title: 'روند مالی', enabled: true, order: 2 },
  { id: 'budget', type: 'budget', title: 'وضعیت بودجه', enabled: true, order: 3 },
  { id: 'recent-transactions', type: 'recent-transactions', title: 'تراکنش‌های اخیر', enabled: true, order: 4 },
];

// Default categories with subcategories
export const defaultExpenseCategories = [
  {
    name: 'خانه',
    icon: 'Home',
    color: 'hsl(25, 95%, 53%)',
    subcategories: ['اجاره / رهن', 'قبوض برق', 'قبوض آب', 'قبوض گاز', 'اینترنت', 'تلفن', 'تعمیرات و نگهداری']
  },
  {
    name: 'حمل و نقل',
    icon: 'Car',
    color: 'hsl(199, 89%, 48%)',
    subcategories: ['بنزین / سوخت', 'تاکسی', 'مترو', 'اتوبوس', 'بیمه خودرو', 'تعمیرات خودرو', 'پارکینگ']
  },
  {
    name: 'خوراک و نوشیدنی',
    icon: 'UtensilsCrossed',
    color: 'hsl(38, 92%, 50%)',
    subcategories: ['خرید مواد غذایی', 'رستوران و کافه', 'نوشیدنی و میان‌وعده']
  },
  {
    name: 'سرگرمی و تفریح',
    icon: 'Gamepad2',
    color: 'hsl(262, 83%, 58%)',
    subcategories: ['سینما و تئاتر', 'کافه و دورهمی', 'سفر و مسافرت', 'ورزش و باشگاه']
  },
  {
    name: 'پوشاک و مد',
    icon: 'ShoppingBag',
    color: 'hsl(330, 80%, 60%)',
    subcategories: ['لباس', 'کفش', 'اکسسوری و لوازم جانبی']
  },
  {
    name: 'سلامت و بهداشت',
    icon: 'Heart',
    color: 'hsl(0, 72%, 51%)',
    subcategories: ['دارو و درمان', 'تجهیزات پزشکی', 'آرایش و بهداشت شخصی', 'بیمه سلامت']
  },
  {
    name: 'آموزش و توسعه فردی',
    icon: 'Book',
    color: 'hsl(168, 76%, 42%)',
    subcategories: ['کتاب و مجله', 'دوره‌های آموزشی آنلاین', 'کلاس‌ها و کارگاه‌ها']
  },
  {
    name: 'بدهی و قسط',
    icon: 'Receipt',
    color: 'hsl(0, 60%, 45%)',
    subcategories: ['وام‌ها', 'قسط‌های خرید', 'سایر بدهی‌ها']
  },
  {
    name: 'سایر هزینه‌ها',
    icon: 'MoreHorizontal',
    color: 'hsl(220, 14%, 50%)',
    subcategories: ['هدیه و کمک به دیگران', 'جریمه و مالیات', 'هزینه‌های اضطراری']
  }
];

export const defaultIncomeCategories = [
  {
    name: 'حقوق و دستمزد',
    icon: 'Wallet',
    color: 'hsl(142, 71%, 45%)',
    subcategories: ['حقوق ثابت', 'اضافه‌کار', 'پاداش']
  },
  {
    name: 'سرمایه‌گذاری و پس‌انداز',
    icon: 'TrendingUp',
    color: 'hsl(168, 76%, 42%)',
    subcategories: ['سود بانکی', 'بورس و سهام', 'طلا و ارز', 'سود سرمایه‌گذاری']
  },
  {
    name: 'سایر درآمدها',
    icon: 'Gift',
    color: 'hsl(38, 92%, 50%)',
    subcategories: ['هدیه', 'کار آزاد', 'سایر']
  }
];
