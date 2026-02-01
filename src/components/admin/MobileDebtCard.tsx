import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, Calendar, User } from 'lucide-react';
import { AdminDebt } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface MobileDebtCardProps {
  debt: AdminDebt;
  onDelete: (debt: AdminDebt) => void;
}

export function MobileDebtCard({ debt, onDelete }: MobileDebtCardProps) {
  const progress = debt.total_amount > 0 
    ? Math.round((debt.paid_amount / debt.total_amount) * 100) 
    : 0;

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-3 hover:border-primary/30 transition-all active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base truncate text-foreground">{debt.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
            <User className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{debt.userName}</span>
            <span className="text-border">•</span>
            <span>طلبکار: <strong className="text-foreground">{debt.creditor}</strong></span>
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(debt)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 w-11 shrink-0 border-2 border-destructive/30"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded-xl p-3 border-2 border-border/50">
          <p className="text-muted-foreground mb-1">کل مبلغ</p>
          <p className="font-mono font-bold text-sm text-foreground">{formatCurrency(debt.total_amount)}</p>
        </div>
        <div className="bg-success/10 rounded-xl p-3 border-2 border-success/20">
          <p className="text-muted-foreground mb-1">پرداخت شده</p>
          <p className="font-mono font-bold text-sm text-success">{formatCurrency(debt.paid_amount)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">پیشرفت پرداخت</span>
          <span className={`font-mono font-bold ${progress >= 100 ? 'text-success' : 'text-primary'}`}>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      {/* Due Date */}
      {debt.due_date && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-warning/10 rounded-xl px-3 py-2 border-2 border-warning/20">
          <Calendar className="w-4 h-4 text-warning" strokeWidth={2} />
          <span>سررسید: <strong className="text-foreground">{debt.due_date}</strong></span>
        </div>
      )}
    </div>
  );
}
