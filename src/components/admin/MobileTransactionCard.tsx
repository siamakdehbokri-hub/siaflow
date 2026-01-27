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
    <div className="bg-card rounded-xl border-2 border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Category & Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{transaction.category}</span>
            <Badge 
              variant="outline" 
              className={cn(
                "rounded-lg text-xs",
                isIncome 
                  ? "bg-green-500/10 text-green-600" 
                  : "bg-red-500/10 text-red-600"
              )}
            >
              {isIncome ? 'درآمد' : 'هزینه'}
            </Badge>
          </div>

          {/* User & Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{transaction.userName}</span>
            <span>•</span>
            <span>{transaction.date}</span>
          </div>

          {/* Description */}
          {transaction.description && (
            <p className="text-xs text-muted-foreground truncate">
              {transaction.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Amount */}
          <span className={cn(
            "font-mono font-bold text-base",
            isIncome ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(transaction.amount)}
          </span>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(transaction)}
            className="text-destructive hover:text-destructive rounded-xl h-9 w-9"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
