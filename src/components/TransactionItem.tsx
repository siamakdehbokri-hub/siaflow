import { 
  UtensilsCrossed, Car, ShoppingBag, Receipt, Heart, 
  Gamepad2, Wallet, TrendingUp, MoreVertical, RefreshCw 
} from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatCurrency, formatDate } from '@/data/mockData';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'غذا و رستوران': UtensilsCrossed,
  'حمل و نقل': Car,
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
      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-all duration-200 cursor-pointer group animate-fade-in"
    >
      <div className={cn(
        "p-3 rounded-xl transition-colors duration-200",
        isIncome 
          ? "bg-success/10 group-hover:bg-success/20" 
          : "bg-destructive/10 group-hover:bg-destructive/20"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isIncome ? "text-success" : "text-destructive"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{transaction.description}</h4>
          {transaction.isRecurring && (
            <RefreshCw className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{transaction.category}</p>
      </div>

      <div className="text-left">
        <p className={cn(
          "font-semibold",
          isIncome ? "text-success" : "text-destructive"
        )}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
      </div>

      <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-accent transition-all duration-200">
        <MoreVertical className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
