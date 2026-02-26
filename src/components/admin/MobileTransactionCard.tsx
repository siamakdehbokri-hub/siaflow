import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, MoreVertical, User, Calendar, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    <div className="glass rounded-xl p-3 transition-all active:scale-[0.99]">
      <div className="flex items-center justify-between gap-2">
        <div className="shrink-0">
          <span className={cn(
            "font-mono font-bold text-lg tabular-nums",
            isIncome ? 'text-success' : 'text-destructive'
          )} dir="ltr">
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
        </div>

        <div className="flex-1 min-w-0 mx-2">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-foreground truncate">
              {transaction.category}
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "rounded-md text-[9px] h-5 px-1.5 font-medium shrink-0",
                isIncome 
                  ? "bg-success/10 text-success border-success/20" 
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              {isIncome ? 'درآمد' : 'هزینه'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <User className="w-3 h-3" strokeWidth={2} />
              {transaction.userName}
            </span>
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" strokeWidth={2} />
              <span dir="ltr">{transaction.date}</span>
            </span>
          </div>
          
          {transaction.description && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
              <FileText className="w-3 h-3 shrink-0" strokeWidth={2} />
              <span className="truncate">{transaction.description}</span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 rounded-xl">
            <DropdownMenuItem 
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive py-2.5 rounded-lg"
            >
              <Trash2 className="w-4 h-4 ml-2" strokeWidth={2} />
              حذف تراکنش
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
