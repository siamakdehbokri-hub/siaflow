import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, RefreshCw,
  Home, Gift, Book, MoreHorizontal, Tag, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'خانه': Home,
  'حمل و نقل': Car,
  'خوراک و نوشیدنی': UtensilsCrossed,
  'سرگرمی و تفریح': Gamepad2,
  'پوشاک و مد': ShoppingBag,
  'سلامت و بهداشت': Heart,
  'آموزش و توسعه فردی': Book,
  'بدهی و قسط': Receipt,
  'سایر هزینه‌ها': MoreHorizontal,
  'حقوق و دستمزد': Wallet,
  'سرمایه‌گذاری و پس‌انداز': TrendingUp,
  'سایر درآمدها': Gift,
  // Legacy support
  'غذا و رستوران': UtensilsCrossed,
  'خرید': ShoppingBag,
  'قبوض': Receipt,
  'سلامت': Heart,
  'تفریح': Gamepad2,
  'حقوق': Wallet,
  'سرمایه‌گذاری': TrendingUp,
};

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const CategoryIcon = iconMap[transaction.category] || Receipt;
  const isIncome = transaction.type === 'income';
  const DirectionIcon = isIncome ? ArrowUpRight : ArrowDownRight;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
        "bg-card hover:bg-accent/30 cursor-pointer",
        "border border-transparent hover:border-border/50",
        "hover-lift"
      )}
    >
      {/* Icon Container */}
      <div className={cn(
        "relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
        isIncome 
          ? "bg-success/10 text-success group-hover:bg-success/15" 
          : "bg-destructive/10 text-destructive group-hover:bg-destructive/15"
      )}>
        <CategoryIcon className="w-5 h-5" />
        {transaction.isRecurring && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <RefreshCw className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate text-sm">
              {transaction.description || transaction.category}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {transaction.category}
              </span>
              {transaction.subcategory && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">
                    {transaction.subcategory}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-left shrink-0">
            <p className={cn(
              "font-bold text-sm tabular-nums flex items-center gap-1",
              isIncome ? "text-success" : "text-foreground"
            )}>
              <DirectionIcon className="w-3 h-3" />
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatPersianDateShort(transaction.date)}
            </p>
          </div>
        </div>

        {/* Tags */}
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {transaction.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-[10px] py-0 px-1.5 gap-0.5"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </Badge>
            ))}
            {transaction.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{transaction.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Indicator */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
    </div>
  );
}
