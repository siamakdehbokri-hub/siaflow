import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-3.5",
      },
      variant: {
        default: "[&>div]:bg-primary",
        success: "[&>div]:bg-success",
        warning: "[&>div]:bg-warning",
        danger: "[&>div]:bg-destructive",
        // Semantic variants for context
        budget: "[&>div]:bg-chart-1",
        savings: "[&>div]:bg-success",
        debt: "[&>div]:bg-warning",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      animated: false,
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  showLabel?: boolean;
  labelPosition?: "inside" | "outside";
  animated?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, variant, showLabel, labelPosition = "outside", animated, ...props }, ref) => {
  const percentage = Math.min(Math.max(value || 0, 0), 100);
  
  // Determine variant based on value if not explicitly set
  const autoVariant = React.useMemo(() => {
    if (variant) return variant;
    if (percentage >= 100) return "danger";
    if (percentage >= 80) return "warning";
    return "default";
  }, [variant, percentage]);

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, variant: autoVariant }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(indicatorVariants({ animated }))}
          style={{ 
            width: `${percentage}%`,
            // Use translateX for RTL compatibility
          }}
        />
        
        {/* Inside label */}
        {showLabel && labelPosition === "inside" && size === "lg" && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground mix-blend-difference">
            {Math.round(percentage)}٪
          </span>
        )}
      </ProgressPrimitive.Root>
      
      {/* Outside label */}
      {showLabel && labelPosition === "outside" && (
        <span className="absolute -top-5 left-0 text-xs font-medium text-muted-foreground">
          {Math.round(percentage)}٪
        </span>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressVariants };
