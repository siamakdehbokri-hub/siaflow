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
        "group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-400",
        "glass-subtle cursor-pointer",
        "hover:glass hover:shadow-elevation-2",
        "active:scale-[0.99]"
      )}
    >
      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-400",
        isIncome ? "bg-success/5" : "bg-muted/50"
      )} />
      
      {/* Icon Container */}
      <div className={cn(
        "relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-400 group-hover:scale-110",
        isIncome 
          ? "bg-gradient-to-br from-success/20 to-success/5" 
          : "bg-gradient-to-br from-destructive/15 to-destructive/5"
      )}>
        {/* Inner glow */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-50 blur-md",
          isIncome ? "bg-success/20" : "bg-destructive/10"
        )} />
        
        <CategoryIcon className={cn(
          "relative w-5 h-5 sm:w-6 sm:h-6",
          isIncome ? "text-success" : "text-destructive"
        )} />
        
        {/* Recurring indicator */}
        {transaction.isRecurring && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center shadow-glow-sm">
            <RefreshCw className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate text-sm sm:text-base">
              {transaction.description || transaction.category}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {transaction.category}
              </span>
              {transaction.subcategory && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary/40" />
                  <span className="text-xs text-primary/80 font-medium">
                    {transaction.subcategory}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-left shrink-0">
            <p className={cn(
              "font-bold text-sm sm:text-base tabular-nums flex items-center gap-1",
              isIncome ? "text-success" : "text-foreground"
            )}>
              <DirectionIcon className={cn(
                "w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110",
                isIncome ? "text-success" : "text-destructive"
              )} />
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatPersianDateShort(transaction.date)}
            </p>
          </div>
        </div>

        {/* Tags */}
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            {transaction.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-[10px] py-0.5 px-2 gap-1 bg-primary/10 text-primary border-0 rounded-lg"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </Badge>
            ))}
            {transaction.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                +{transaction.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Indicator Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full bg-primary group-hover:h-10 transition-all duration-400 origin-center" />
    </div>
  );
}