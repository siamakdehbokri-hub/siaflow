import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminTransaction } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface MobileTransactionCardProps {
  transaction: AdminTransaction;
  onDelete: (tx: AdminTransaction) => void;
}

export function MobileTransactionCard({ transaction, onDelete }: MobileTransactionCardProps) {
  const isIncome = transaction.type === 'income';

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-4 hover:border-primary/30 transition-all active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Category & Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground">{transaction.category}</span>
            <Badge 
              variant="outline" 
              className={cn(
                "rounded-xl text-xs h-6 px-2 font-medium border-2",
                isIncome 
                  ? "bg-success/10 text-success border-success/30" 
                  : "bg-destructive/10 text-destructive border-destructive/30"
              )}
            >
              {isIncome ? '+ درآمد' : '- هزینه'}
            </Badge>
          </div>

          {/* User & Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{transaction.userName}</span>
            <span className="text-border">•</span>
            <span dir="ltr">{transaction.date}</span>
          </div>

          {/* Description */}
          {transaction.description && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1.5 truncate">
              {transaction.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Amount */}
          <span className={cn(
            "font-mono font-bold text-base tabular-nums",
            isIncome ? 'text-success' : 'text-destructive'
          )}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(transaction)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 border-2 border-destructive/30"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
