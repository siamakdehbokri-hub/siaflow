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
      <div className="p-6 rounded-2xl bg-card border border-border/30 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
        <Clock className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">هنوز تراکنشی ثبت نشده</p>
        <p className="text-xs text-muted-foreground/70 mt-1">با دکمه + اولین تراکنش خود را ثبت کنید</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-muted-foreground">فعالیت اخیر</h3>
        <button 
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          همه
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="bg-card rounded-2xl border border-border/30 divide-y divide-border/30">
        {recentItems.map((transaction, index) => {
          const isIncome = transaction.type === 'income';
          
          return (
            <div 
              key={transaction.id} 
              className="flex items-center gap-3 p-4 first:rounded-t-2xl last:rounded-b-2xl"
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                isIncome ? "bg-success/10" : "bg-destructive/10"
              )}>
                {isIncome ? (
                  <ArrowUpRight className="w-5 h-5 text-success" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-destructive" />
                )}
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {transaction.category}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {transaction.description || transaction.subcategory || '—'}
                </p>
              </div>
              
              {/* Amount */}
              <div className="text-left shrink-0">
                <p className={cn(
                  "text-sm font-semibold",
                  isIncome ? "text-success" : "text-destructive"
                )}>
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground">
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
