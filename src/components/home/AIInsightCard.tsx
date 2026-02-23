import { Sparkles, ChevronLeft, Lightbulb, TrendingUp, AlertCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightCardProps {
  type?: 'tip' | 'warning' | 'achievement';
  title: string;
  message: string;
  onClick?: () => void;
}

const typeConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  tip: {
    icon: Lightbulb,
    color: 'text-primary',
    bgColor: 'bg-primary/12 border-primary/15',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/12 border-warning/15',
  },
  achievement: {
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/12 border-success/15',
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
        "w-full text-right p-4 rounded-2xl transition-all duration-200",
        "active:scale-[0.98] glass-card hover:shadow-card-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "animate-fade-in"
      )}
      style={{ animationDelay: '200ms' }}
    >
      <div className="flex items-start gap-3 relative z-10">
        {/* Icon */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm border",
          config.bgColor
        )}>
          <Sparkles className={cn("w-5 h-5", config.color)} strokeWidth={2} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">
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
        
        {/* Arrow */}
        <ChevronLeft className="w-5 h-5 text-muted-foreground shrink-0 self-center" strokeWidth={2} />
      </div>
    </button>
  );
}
