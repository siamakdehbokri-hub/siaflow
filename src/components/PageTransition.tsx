import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export function PageTransition({ 
  children, 
  className,
  direction = 'up' 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getTransformClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left': return 'translate-x-8 opacity-0';
        case 'right': return '-translate-x-8 opacity-0';
        case 'up': return 'translate-y-6 opacity-0';
        case 'down': return '-translate-y-6 opacity-0';
        default: return 'translate-y-6 opacity-0';
      }
    }
    return 'translate-x-0 translate-y-0 opacity-100';
  };

  return (
    <div 
      className={cn(
        "transition-all duration-400 ease-out",
        getTransformClass(),
        className
      )}
    >
      {children}
    </div>
  );
}

// Staggered animation for list items
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({ 
  children, 
  className,
  staggerDelay = 50 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-slide-up"
          style={{ 
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}