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
      <h3 className="text-sm font-medium text-muted-foreground px-1">عملیات سریع</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                action.bgColor
              )}>
                <Icon className={cn("w-5 h-5", action.color)} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
