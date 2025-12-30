import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade';
  delay?: number;
}

export function PageTransition({ 
  children, 
  className,
  direction = 'up',
  delay = 0
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay + 10);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransformClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left': return 'translate-x-6 opacity-0';
        case 'right': return '-translate-x-6 opacity-0';
        case 'up': return 'translate-y-4 opacity-0';
        case 'down': return '-translate-y-4 opacity-0';
        case 'fade': return 'opacity-0 scale-[0.98]';
        default: return 'translate-y-4 opacity-0';
      }
    }
    return 'translate-x-0 translate-y-0 opacity-100 scale-100';
  };

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-out will-change-transform",
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
  staggerDelay = 40 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in-up"
          style={{ 
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both',
            animationDuration: '300ms'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Tab content wrapper for smoother transitions
interface TabContentProps {
  children: ReactNode;
  isActive: boolean;
  direction?: 'left' | 'right' | 'up';
}

export function TabContent({ children, isActive, direction = 'up' }: TabContentProps) {
  const [shouldRender, setShouldRender] = useState(isActive);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!shouldRender) return null;

  return (
    <PageTransition direction={direction} className={cn(!isAnimating && 'pointer-events-none')}>
      {children}
    </PageTransition>
  );
}
