import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, User } from 'lucide-react';
import { AdminGoal } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface MobileGoalCardProps {
  goal: AdminGoal;
  onDelete: (goal: AdminGoal) => void;
}

export function MobileGoalCard({ goal, onDelete }: MobileGoalCardProps) {
  const progress = goal.target_amount > 0 
    ? Math.round((goal.current_amount / goal.target_amount) * 100) 
    : 0;

  return (
    <div className="bg-card rounded-xl border-2 border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Color Icon */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: goal.color + '20' }}
          >
            <span className="text-lg" style={{ color: goal.color }}>●</span>
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-base truncate">{goal.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {goal.userName}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(goal)}
          className="text-destructive hover:text-destructive rounded-xl h-10 w-10 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-muted-foreground">هدف</p>
          <p className="font-mono font-semibold">{formatCurrency(goal.target_amount)}</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-2">
          <p className="text-muted-foreground">پس‌انداز</p>
          <p className="font-mono font-semibold text-green-600">{formatCurrency(goal.current_amount)}</p>
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
    </div>
  );
}
