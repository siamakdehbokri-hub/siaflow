import { 
  Users, CreditCard, Tag, Banknote, Target, 
  Wallet, Settings, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type AdminTabValue = 
  | 'overview'
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

const NAV_ITEMS: { id: AdminTabValue; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'transactions', label: 'تراکنش', icon: CreditCard },
  { id: 'categories', label: 'دسته‌ها', icon: Tag },
  { id: 'accounts', label: 'حساب‌ها', icon: Wallet },
  { id: 'debts', label: 'بدهی', icon: Banknote },
  { id: 'goals', label: 'اهداف', icon: Target },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
];

export function AdminNavigation({ activeTab, onTabChange, counts }: AdminNavigationProps) {
  return (
    <div className="sticky top-0 z-20 overflow-x-auto -mx-4 px-4 py-1.5 bg-background/70 backdrop-blur-xl scrollbar-hide" dir="rtl">
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
                "min-h-[44px] active:scale-[0.98]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "glass text-muted-foreground hover:text-foreground"
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
                      ? "bg-white/20 text-primary-foreground border-0" 
                      : "bg-muted text-muted-foreground"
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
  );
}
