import { memo } from 'react';
import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, RefreshCw,
  Home, Gift, Book, MoreHorizontal, ArrowUpRight, ArrowDownRight, ArrowRight,
  ShoppingCart, GraduationCap, CreditCard, Landmark, Users, Briefcase,
  PiggyBank, Coins, Target
} from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatPersianDateShort } from '@/utils/persianDate';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
  'پس‌انداز و سرمایه‌گذاری': PiggyBank,
  'خرید سرمایه‌ای': Coins,
  'اهداف مالی': Target,
};

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

function TransactionItemComponent({ transaction, onClick }: TransactionItemProps) {
  const CategoryIcon = iconMap[transaction.category] || Receipt;
  const isIncome = transaction.type === 'income';
  const isSaving = transaction.type === 'saving';
  const DirectionIcon = isSaving ? ArrowRight : isIncome ? ArrowUpRight : ArrowDownRight;
  const { formatAmount } = useCurrency();

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 p-4 rounded-2xl transition-colors",
        "bg-card border-2 border-border/40 cursor-pointer",
        "active:bg-muted/50"
      )}
    >
      {/* 3D Icon Container */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
        isSaving
          ? "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/10"
          : isIncome 
            ? "bg-gradient-to-br from-success/15 to-success/5 border-success/10" 
            : "bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/10"
      )}>
        <CategoryIcon className={cn(
          "w-5.5 h-5.5",
          isSaving ? "text-primary" : isIncome ? "text-success" : "text-destructive"
        )} strokeWidth={2} />
        
        {/* Recurring indicator */}
        {transaction.isRecurring && (
          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm border border-card">
            <RefreshCw className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-foreground truncate text-sm">
              {transaction.description || transaction.category}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground truncate">
                {transaction.category}
              </span>
              {transaction.subcategory && (
                <>
                  <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                  <span className="text-xs text-primary/80 font-medium truncate">
                    {transaction.subcategory}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-left shrink-0">
            <p className={cn(
              "font-black text-sm tabular-nums flex items-center gap-0.5",
              isSaving ? "text-primary" : isIncome ? "text-success" : "text-foreground"
            )}>
              <DirectionIcon className={cn(
                "w-3.5 h-3.5",
                isSaving ? "text-primary" : isIncome ? "text-success" : "text-destructive"
              )} strokeWidth={2.5} />
              {formatAmount(transaction.amount)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatPersianDateShort(transaction.date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TransactionItem = memo(TransactionItemComponent);
