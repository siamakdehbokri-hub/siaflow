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
  subcategories?: string[] | Subcategory[];
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

// Default categories with subcategories - NEW COMPREHENSIVE LIST
export const defaultExpenseCategories = [
  {
    name: 'خوراک و خرید روزمره',
    icon: 'ShoppingCart',
    color: 'hsl(38, 92%, 50%)',
    subcategories: ['خرید سوپرمارکت', 'رستوران و کافی‌شاپ', 'خوراک بیرون‌بر', 'خوراک مهمانی']
  },
  {
    name: 'خانه و زندگی',
    icon: 'Home',
    color: 'hsl(25, 95%, 53%)',
    subcategories: ['اجاره / شارژ ساختمان', 'قبوض', 'لوازم خانگی', 'تعمیرات منزل']
  },
  {
    name: 'حمل و نقل',
    icon: 'Car',
    color: 'hsl(199, 89%, 48%)',
    subcategories: ['بنزین', 'تاکسی / اسنپ', 'سرویس خودرو', 'اقساط خودرو']
  },
  {
    name: 'سلامت و درمان',
    icon: 'Heart',
    color: 'hsl(0, 72%, 51%)',
    subcategories: ['دکتر و ویزیت', 'دارو', 'آزمایش', 'بیمه درمانی']
  },
  {
    name: 'خرید شخصی و پوشاک',
    icon: 'ShoppingBag',
    color: 'hsl(330, 80%, 60%)',
    subcategories: ['لباس', 'کفش', 'لوازم آرایشی', 'اکسسوری']
  },
  {
    name: 'سرگرمی و تفریح',
    icon: 'Gamepad2',
    color: 'hsl(262, 83%, 58%)',
    subcategories: ['سینما / تئاتر', 'سفر', 'کافی‌شاپ و دورهمی', 'سرگرمی خانگی']
  },
  {
    name: 'اشتراک‌ها و پرداخت ماهانه',
    icon: 'CreditCard',
    color: 'hsl(210, 80%, 55%)',
    subcategories: ['اشتراک آنلاین', 'اینترنت و تلفن', 'عضویت باشگاه']
  },
  {
    name: 'مالی و بانک',
    icon: 'Landmark',
    color: 'hsl(220, 70%, 45%)',
    subcategories: ['اقساط و بدهی', 'وام', 'کارمزد انتقال', 'سرمایه‌گذاری']
  },
  {
    name: 'خانواده و روابط',
    icon: 'Users',
    color: 'hsl(340, 75%, 55%)',
    subcategories: ['هدیه', 'کمک به خانواده', 'هزینه فرزند']
  },
  {
    name: 'آموزش و رشد فردی',
    icon: 'GraduationCap',
    color: 'hsl(168, 76%, 42%)',
    subcategories: ['دوره آموزشی', 'کتاب', 'سمینار و وبینار']
  },
  {
    name: 'سایر هزینه‌ها',
    icon: 'MoreHorizontal',
    color: 'hsl(220, 14%, 50%)',
    subcategories: ['متفرقه']
  }
];

export const defaultIncomeCategories = [
  {
    name: 'حقوق و درآمد شغلی',
    icon: 'Wallet',
    color: 'hsl(142, 71%, 45%)',
    subcategories: ['حقوق ماهانه', 'درآمد پروژه', 'پاداش']
  },
  {
    name: 'کار و پول‌سازی',
    icon: 'Briefcase',
    color: 'hsl(160, 70%, 40%)',
    subcategories: ['درآمد پروژه', 'تجهیزات کاری', 'نرم‌افزار کاری', 'تبلیغات']
  },
  {
    name: 'سرمایه‌گذاری',
    icon: 'TrendingUp',
    color: 'hsl(168, 76%, 42%)',
    subcategories: ['سود سهام', 'سود بانکی', 'کریپتو', 'طلا و ارز']
  },
  {
    name: 'سایر درآمدها',
    icon: 'Gift',
    color: 'hsl(38, 92%, 50%)',
    subcategories: ['هدیه', 'فروش اجناس', 'متفرقه']
  }
];
