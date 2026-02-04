import { 
  Users, CreditCard, Tag, Banknote, Target, 
  Wallet, Settings, LayoutGrid 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type AdminTabValue = 
  | 'users' 
  | 'transactions' 
  | 'categories' 
  | 'debts' 
  | 'goals' 
  | 'accounts' 
  | 'settings';

interface AdminNavigationProps {
  activeTab: AdminTabValue;
  onTabChange: (tab: AdminTabValue) => void;
  counts?: {
    users?: number;
    transactions?: number;
    categories?: number;
    debts?: number;
    goals?: number;
    accounts?: number;
  };
}

const NAV_ITEMS: { id: AdminTabValue; label: string; icon: React.ElementType; group: 'users' | 'finance' | 'system' }[] = [
  { id: 'users', label: 'کاربران', icon: Users, group: 'users' },
  { id: 'transactions', label: 'تراکنش', icon: CreditCard, group: 'finance' },
  { id: 'categories', label: 'دسته‌ها', icon: Tag, group: 'finance' },
  { id: 'accounts', label: 'حساب‌ها', icon: Wallet, group: 'finance' },
  { id: 'debts', label: 'بدهی', icon: Banknote, group: 'finance' },
  { id: 'goals', label: 'اهداف', icon: Target, group: 'finance' },
  { id: 'settings', label: 'تنظیمات', icon: Settings, group: 'system' },
];

export function AdminNavigation({ activeTab, onTabChange, counts }: AdminNavigationProps) {
  return (
    <div className="space-y-2">
      {/* Primary Navigation - Scrollable Pills */}
      <div className="overflow-x-auto -mx-4 px-4" dir="rtl">
        <div className="flex gap-2 min-w-max pb-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const count = counts?.[item.id as keyof typeof counts];

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200",
                  "border-2 min-h-[44px]",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-slate-800 text-white border-slate-800 shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{item.label}</span>
                {count !== undefined && count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "h-5 min-w-[20px] px-1.5 text-[10px] font-mono rounded-md",
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {count > 999 ? '999+' : count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
