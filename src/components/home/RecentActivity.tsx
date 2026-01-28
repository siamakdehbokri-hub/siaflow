import { ChevronLeft, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Transaction } from '@/types/expense';
import { formatCurrency, formatPersianDateFull } from '@/utils/persianDate';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function RecentActivity({ transactions, onViewAll }: RecentActivityProps) {
  const recentItems = transactions.slice(0, 4);
  
  if (recentItems.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-card border-2 border-border/40 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
        <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1.5} />
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
      
      <div className="bg-card rounded-2xl border-2 border-border/40 divide-y divide-border/40 overflow-hidden">
        {recentItems.map((transaction, index) => {
          const isIncome = transaction.type === 'income';
          
          return (
            <div 
              key={transaction.id} 
              className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              {/* Icon - 44px container */}
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                isIncome ? "bg-success/10" : "bg-destructive/10"
              )}>
                {isIncome ? (
                  <ArrowUpRight className="w-6 h-6 text-success" strokeWidth={2} />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-destructive" strokeWidth={2} />
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
                  "text-sm font-bold",
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
