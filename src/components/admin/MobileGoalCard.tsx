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
    <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-3 hover:border-primary/30 transition-all active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Color Icon */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: goal.color + '15' }}
          >
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: goal.color }}
            />
          </div>

          <div className="min-w-0">
            <p className="font-bold text-base truncate text-foreground">{goal.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5" strokeWidth={2} />
              {goal.userName}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(goal)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 w-11 shrink-0 border-2 border-destructive/30"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded-xl p-3 border-2 border-border/50">
          <p className="text-muted-foreground mb-1">🎯 هدف</p>
          <p className="font-mono font-bold text-sm text-foreground">{formatCurrency(goal.target_amount)}</p>
        </div>
        <div className="bg-success/10 rounded-xl p-3 border-2 border-success/20">
          <p className="text-muted-foreground mb-1">💰 پس‌انداز</p>
          <p className="font-mono font-bold text-sm text-success">{formatCurrency(goal.current_amount)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">پیشرفت</span>
          <span className={`font-mono font-bold ${progress >= 100 ? 'text-success' : 'text-primary'}`}>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>
    </div>
  );
}
