import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, AlertTriangle, Home,
  Gift, Book, MoreHorizontal
} from 'lucide-react';
import { Category } from '@/types/expense';
import { formatCurrency } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Heart,
  Gamepad2,
  Wallet,
  TrendingUp,
  Home,
  Gift,
  Book,
  MoreHorizontal,
};

interface CategoryBudgetProps {
  category: Category;
}

export function CategoryBudget({ category }: CategoryBudgetProps) {
  const Icon = iconMap[category.icon] || Receipt;
  const progress = category.budget && category.spent 
    ? (category.spent / category.budget) * 100 
    : 0;
  const isOverBudget = progress >= 90;
  const remaining = category.budget ? category.budget - (category.spent || 0) : 0;

  if (!category.budget) return null;

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div 
          className="p-1.5 sm:p-2 rounded-lg shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon 
            className="w-4 h-4" 
            style={{ color: category.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{category.name}</h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {formatCurrency(category.spent || 0)} از {formatCurrency(category.budget)}
          </p>
        </div>
        {isOverBudget && (
          <div className="p-1 sm:p-1.5 rounded-lg bg-warning/10 shrink-0">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
          </div>
        )}
      </div>

      <Progress 
        value={Math.min(progress, 100)} 
        className={cn(
          "h-1.5 sm:h-2",
          isOverBudget && "[&>div]:bg-warning"
        )}
      />

      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {Math.round(progress)}% استفاده شده
        </span>
        <span className={cn(
          "text-[10px] sm:text-xs font-medium",
          remaining < 0 ? "text-destructive" : "text-success"
        )}>
          {remaining >= 0 ? `${formatCurrency(remaining)} باقی‌مانده` : `${formatCurrency(Math.abs(remaining))} بیشتر`}
        </span>
      </div>
    </div>
  );
}
