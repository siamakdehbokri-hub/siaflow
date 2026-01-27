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
    <div className="bg-card rounded-xl border-2 border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base truncate">{debt.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <User className="w-3 h-3" />
            {debt.userName} • طلبکار: {debt.creditor}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(debt)}
          className="text-destructive hover:text-destructive rounded-xl h-10 w-10 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-muted-foreground">کل مبلغ</p>
          <p className="font-mono font-semibold">{formatCurrency(debt.total_amount)}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-2">
          <p className="text-muted-foreground">پرداخت شده</p>
          <p className="font-mono font-semibold text-green-600">{formatCurrency(debt.paid_amount)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">پیشرفت</span>
          <span className="font-mono font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Due Date */}
      {debt.due_date && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          سررسید: {debt.due_date}
        </div>
      )}
    </div>
  );
}
