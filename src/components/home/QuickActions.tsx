import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Target, CreditCard, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  icon: typeof ArrowDownRight;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    id: 'expense',
    icon: ArrowDownRight,
    label: 'هزینه',
    description: 'ثبت هزینه جدید',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    id: 'income',
    icon: ArrowUpRight,
    label: 'درآمد',
    description: 'ثبت درآمد جدید',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    id: 'transfer',
    icon: ArrowLeftRight,
    label: 'انتقال',
    description: 'بین حساب‌ها',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

interface QuickActionsProps {
  onAction: (actionId: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="space-y-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <h3 className="text-sm font-semibold text-muted-foreground px-1">عملیات سریع</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={cn(
                // Minimum 80px height for comfortable touch target
                "group relative flex flex-col items-center justify-center gap-2.5 min-h-[88px] p-4",
                "rounded-2xl bg-card border-2 border-border/40",
                "hover:border-border transition-all duration-200",
                "hover:shadow-lg active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
                action.bgColor
              )}>
                <Icon className={cn("w-6 h-6", action.color)} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
