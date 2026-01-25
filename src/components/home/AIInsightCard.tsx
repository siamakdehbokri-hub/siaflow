import { Sparkles, ChevronLeft, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightCardProps {
  type?: 'tip' | 'warning' | 'achievement';
  title: string;
  message: string;
  onClick?: () => void;
}

const typeConfig = {
  tip: {
    icon: Lightbulb,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  achievement: {
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
};

export function AIInsightCard({ 
  type = 'tip', 
  title, 
  message, 
  onClick 
}: AIInsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-right p-4 rounded-2xl border transition-all duration-300",
        "bg-card hover:shadow-lg active:scale-[0.98]",
        config.borderColor,
        "animate-fade-in"
      )}
      style={{ animationDelay: '200ms' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          config.bgColor
        )}>
          <Sparkles className={cn("w-5 h-5", config.color)} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              بینش هوشمند
            </span>
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {message}
          </p>
        </div>
        
        {/* Arrow */}
        <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
      </div>
    </button>
  );
}
