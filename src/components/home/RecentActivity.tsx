import { useMemo } from 'react';
import { ChevronLeft, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatCurrency, formatPersianDateFull } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function RecentActivity({ transactions, onViewAll }: RecentActivityProps) {
  const recentItems = useMemo(() => 
    [...transactions]
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.id.localeCompare(a.id);
      })
      .slice(0, 4),
    [transactions]
  );
  
  if (recentItems.length === 0) {
    return (
      <div className="p-6 rounded-2xl text-center animate-fade-in glass-card" style={{ animationDelay: '300ms' }}>
        <div className="w-14 h-14 rounded-2xl bg-muted/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-border/30">
          <Receipt className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
        <p className="text-xs text-muted-foreground/70 mt-1">با دکمه + اولین تراکنش خود را ثبت کنید</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-muted-foreground">فعالیت اخیر</h3>
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline py-2 px-1 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          همه
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
      
      <div className="rounded-2xl divide-y divide-border/30 overflow-hidden glass-card">
        {recentItems.map((transaction) => {
          const isIncome = transaction.type === 'income';
          
          return (
            <div 
              key={transaction.id} 
              className="flex items-center gap-3 p-4 hover:bg-muted/15 transition-colors"
            >
              {/* Icon */}
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm border",
                isIncome ? "bg-success/12 border-success/15" : "bg-destructive/12 border-destructive/15"
              )}>
                {isIncome ? (
                  <ArrowUpRight className="w-5 h-5 text-success" strokeWidth={2} />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-destructive" strokeWidth={2} />
                )}
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {transaction.category}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {transaction.description || transaction.subcategory || '—'}
                </p>
              </div>
              
              {/* Amount */}
              <div className="text-left shrink-0">
                <p className={cn(
                  "text-sm font-bold tabular-nums",
                  isIncome ? "text-success" : "text-destructive"
                )}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {formatPersianDateFull(transaction.date).split(' ')[0]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
