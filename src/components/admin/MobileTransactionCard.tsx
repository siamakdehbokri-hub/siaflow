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
    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-3 transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Amount (Primary) */}
        <div className="shrink-0">
          <span className={cn(
            "font-mono font-bold text-lg tabular-nums",
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          )} dir="ltr">
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
        </div>

        {/* Center: Details */}
        <div className="flex-1 min-w-0 mx-2">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
              {transaction.category}
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "rounded-md text-[9px] h-5 px-1.5 font-medium border shrink-0",
                isIncome 
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                  : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              )}
            >
              {isIncome ? 'درآمد' : 'هزینه'}
            </Badge>
          </div>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-0.5">
              <User className="w-3 h-3" strokeWidth={2} />
              {transaction.userName}
            </span>
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" strokeWidth={2} />
              <span dir="ltr">{transaction.date}</span>
            </span>
          </div>
          
          {/* Description */}
          {transaction.description && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <FileText className="w-3 h-3 shrink-0" strokeWidth={2} />
              <span className="truncate">{transaction.description}</span>
            </div>
          )}
        </div>

        {/* Right: Actions (Secondary) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <MoreVertical className="w-4 h-4" strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 rounded-xl">
            <DropdownMenuItem 
              onClick={() => onDelete(transaction)}
              className="text-red-600 focus:text-red-600 py-2.5 rounded-lg"
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
