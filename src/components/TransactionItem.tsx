import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, MoreVertical, RefreshCw,
  Home, Gift, Book, MoreHorizontal
} from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatCurrency, formatPersianDate } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

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
  const Icon = iconMap[transaction.category] || Receipt;
  const isIncome = transaction.type === 'income';

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-all duration-200 cursor-pointer group animate-fade-in"
    >
      <div className={cn(
        "p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors duration-200 shrink-0",
        isIncome 
          ? "bg-success/10 group-hover:bg-success/20" 
          : "bg-destructive/10 group-hover:bg-destructive/20"
      )}>
        <Icon className={cn(
          "w-4 h-4 sm:w-5 sm:h-5",
          isIncome ? "text-success" : "text-destructive"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <h4 className="font-medium text-foreground truncate text-sm sm:text-base">{transaction.description}</h4>
          {transaction.isRecurring && (
            <RefreshCw className="w-3 h-3 text-muted-foreground shrink-0" />
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.category}</p>
      </div>

      <div className="text-left shrink-0">
        <p className={cn(
          "font-semibold text-sm sm:text-base",
          isIncome ? "text-success" : "text-destructive"
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{formatPersianDate(transaction.date)}</p>
      </div>

      <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent transition-all duration-200 hidden sm:block">
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
