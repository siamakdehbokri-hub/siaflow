import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { Category } from '@/types/expense';
import { formatCurrency } from '@/data/mockData';
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
    <div className="p-4 rounded-xl bg-card border border-border/50 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon 
            className="w-4 h-4" 
            style={{ color: category.color }}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{category.name}</h4>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(category.spent || 0)} از {formatCurrency(category.budget)}
          </p>
        </div>
        {isOverBudget && (
          <div className="p-1.5 rounded-lg bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
        )}
      </div>

      <Progress 
        value={Math.min(progress, 100)} 
        className={cn(
          "h-2",
          isOverBudget && "[&>div]:bg-warning"
        )}
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {Math.round(progress)}% استفاده شده
        </span>
        <span className={cn(
          "text-xs font-medium",
          remaining < 0 ? "text-destructive" : "text-success"
        )}>
          {remaining >= 0 ? `${formatCurrency(remaining)} باقی‌مانده` : `${formatCurrency(Math.abs(remaining))} بیشتر`}
        </span>
      </div>
    </div>
  );
}
