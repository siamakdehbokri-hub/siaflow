import { memo } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownRight, ArrowRight, Receipt } from 'lucide-react';
import { transactionCategoryIconMap } from '@/utils/categoryIcons';
import { Transaction } from '@/types/expense';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

function TransactionItemComponent({ transaction, onClick }: TransactionItemProps) {
  const CategoryIcon = transactionCategoryIconMap[transaction.category] || Receipt;
  const isIncome = transaction.type === 'income';
  const isSaving = transaction.type === 'saving';
  const DirectionIcon = isSaving ? ArrowRight : isIncome ? ArrowUpRight : ArrowDownRight;
  const { formatAmount } = useCurrency();

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 p-4 rounded-2xl transition-colors cursor-pointer",
        "active:bg-muted/20"
      )}
      style={{
        background: 'hsl(var(--card) / 0.5)',
        border: '1px solid hsl(var(--border) / 0.35)',
      }}
    >
      {/* 3D Icon Container */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        isSaving
          ? "bg-primary/12 border border-primary/20"
          : isIncome 
            ? "bg-success/12 border border-success/20" 
            : "bg-destructive/12 border border-destructive/20"
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
