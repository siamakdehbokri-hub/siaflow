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
        // Full-width touch target with proper sizing
        "w-full text-right p-4 rounded-2xl border-2 transition-all duration-200",
        "bg-card hover:shadow-md active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        config.borderColor,
        "animate-fade-in"
      )}
      style={{ animationDelay: '200ms' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon - 44px for touch */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          config.bgColor
        )}>
          <Sparkles className={cn("w-6 h-6", config.color)} strokeWidth={2} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              بینش هوشمند
            </span>
          </div>
          <h4 className="text-sm font-bold text-foreground mb-1 line-clamp-1">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Arrow - proper alignment */}
        <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 self-center" strokeWidth={2} />
      </div>
    </button>
  );
}
