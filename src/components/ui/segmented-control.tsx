import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = true,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex(o => o.id === value);
  const segmentCount = options.length;
  
  const sizeClasses = {
    sm: 'h-10 text-xs',
    md: 'h-12 text-sm',
    lg: 'h-14 text-base',
  };

  return (
    <div 
      className={cn(
        "relative flex p-1 rounded-2xl bg-muted/60 border border-border/30",
        fullWidth && "w-full"
      )}
      role="tablist"
    >
      {/* Animated background indicator - RTL optimized */}
      <div
        className="absolute top-1 bottom-1 rounded-xl bg-primary shadow-md transition-all duration-300 ease-out pointer-events-none"
        style={{
          width: `calc(${100 / segmentCount}% - 4px)`,
          right: `calc(${(activeIndex / segmentCount) * 100}% + 2px)`,
        }}
      />

      {options.map((option) => {
        const isActive = value === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-colors duration-200 min-w-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              "active:scale-[0.98]",
              sizeClasses[size],
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            {Icon && (
              <Icon 
                className={cn(
                  "shrink-0",
                  size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
                )} 
                strokeWidth={2} 
              />
            )}
            <span className="truncate max-w-[80px]">{option.label}</span>
            
            {/* Badge */}
            {option.badge !== undefined && option.badge > 0 && (
              <span className={cn(
                "flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-xs font-bold",
                isActive 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-destructive text-destructive-foreground"
              )}>
                {option.badge > 99 ? '99+' : option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Simple pill-style filter buttons
interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger';
}

export function FilterPill({ label, isActive, onClick, variant = 'default' }: FilterPillProps) {
  const variantClasses = {
    default: isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground',
    success: isActive ? 'bg-success text-success-foreground border-success' : 'bg-card border-border text-muted-foreground',
    danger: isActive ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-card border-border text-muted-foreground',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "active:scale-[0.98]",
        variantClasses[variant],
        !isActive && "hover:border-primary/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
