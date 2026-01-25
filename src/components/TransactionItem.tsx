import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, RefreshCw,
  Home, Gift, Book, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  ShoppingCart, GraduationCap, CreditCard, Landmark, Users, Briefcase
} from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // New categories
  'خوراک و خرید روزمره': ShoppingCart,
  'خانه و زندگی': Home,
  'حمل و نقل': Car,
  'سلامت و درمان': Heart,
  'خرید شخصی و پوشاک': ShoppingBag,
  'سرگرمی و تفریح': Gamepad2,
  'اشتراک‌ها و پرداخت ماهانه': CreditCard,
  'مالی و بانک': Landmark,
  'خانواده و روابط': Users,
  'آموزش و رشد فردی': GraduationCap,
  'سایر هزینه‌ها': MoreHorizontal,
  'حقوق و درآمد شغلی': Wallet,
  'کار و پول‌سازی': Briefcase,
  'سرمایه‌گذاری': TrendingUp,
  'سایر درآمدها': Gift,
  // Legacy categories
  'خانه': Home,
  'خوراک و نوشیدنی': UtensilsCrossed,
  'پوشاک و مد': ShoppingBag,
  'سلامت و بهداشت': Heart,
  'آموزش و توسعه فردی': Book,
  'بدهی و قسط': Receipt,
  'حقوق و دستمزد': Wallet,
  'سرمایه‌گذاری و پس‌انداز': TrendingUp,
  'غذا و رستوران': UtensilsCrossed,
  'خرید': ShoppingBag,
  'قبوض': Receipt,
  'سلامت': Heart,
  'تفریح': Gamepad2,
  'حقوق': Wallet,
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
        "group relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-400",
        "glass-subtle cursor-pointer touch-target-lg",
        "hover:glass hover:shadow-elevation-2",
        "active:scale-[0.99] active:bg-muted/50"
      )}
    >
      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-400",
        isIncome ? "bg-success/5" : "bg-muted/50"
      )} />
      
      {/* Icon Container - Mobile optimized */}
      <div className={cn(
        "relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-400 group-hover:scale-110",
        isIncome 
          ? "bg-gradient-to-br from-success/20 to-success/5" 
          : "bg-gradient-to-br from-destructive/15 to-destructive/5"
      )}>
        {/* Inner glow */}
        <div className={cn(
          "absolute inset-0 rounded-xl sm:rounded-2xl opacity-50 blur-md",
          isIncome ? "bg-success/20" : "bg-destructive/10"
        )} />
        
        <CategoryIcon className={cn(
          "relative w-4.5 h-4.5 sm:w-5 sm:h-5",
          isIncome ? "text-success" : "text-destructive"
        )} />
        
        {/* Recurring indicator */}
        {transaction.isRecurring && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full gradient-primary flex items-center justify-center shadow-glow-sm">
            <RefreshCw className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Content - Mobile optimized */}
      <div className="relative flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-foreground truncate text-sm sm:text-base">
              {transaction.description || transaction.category}
            </h4>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
              <span className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {transaction.category}
              </span>
              {transaction.subcategory && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                  <span className="text-[11px] sm:text-xs text-primary/80 font-medium truncate">
                    {transaction.subcategory}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-left shrink-0">
            <p className={cn(
              "font-bold text-sm sm:text-base tabular-nums flex items-center gap-0.5 sm:gap-1",
              isIncome ? "text-success" : "text-foreground"
            )}>
              <DirectionIcon className={cn(
                "w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:scale-110",
                isIncome ? "text-success" : "text-destructive"
              )} />
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              {formatPersianDateShort(transaction.date)}
            </p>
          </div>
        </div>

      </div>

      {/* Hover Indicator Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full bg-primary group-hover:h-8 sm:group-hover:h-10 transition-all duration-400 origin-center" />
    </div>
  );
}