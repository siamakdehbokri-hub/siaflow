import { useState, useRef, memo, useCallback } from 'react';
import { Trash2, Edit3, Clock } from 'lucide-react';
import { Transaction } from '@/types/expense';
import { TransactionItem } from './TransactionItem';
import { cn } from '@/lib/utils';
import { isOfflineId } from '@/lib/networkUtils';

interface SwipeableTransactionProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

function SwipeableTransactionComponent({ transaction, onEdit, onDelete }: SwipeableTransactionProps) {
  const pending = isOfflineId(transaction.id);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwipeIntent, setIsSwipeIntent] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 30; // Min px before swipe activates (prevents accidental triggers)
  const SNAP_THRESHOLD = 80; // Min px to snap open

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
    setIsSwipeIntent(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;
    
    // If vertical movement is dominant, cancel swipe (user is scrolling)
    if (!isSwipeIntent && Math.abs(diffY) > Math.abs(diffX)) {
      setIsDragging(false);
      setOffset(0);
      return;
    }
    
    // Only activate after threshold
    if (!isSwipeIntent && Math.abs(diffX) < SWIPE_THRESHOLD) return;
    
    if (!isSwipeIntent) setIsSwipeIntent(true);
    
    // Allow right swipe (positive diff) to reveal actions
    if (diffX > 0) {
      setOffset(Math.min(diffX - SWIPE_THRESHOLD, 140));
    } else {
      setOffset(Math.max(0, offset + diffX * 0.3));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > SNAP_THRESHOLD) {
      setOffset(140);
    } else {
      setOffset(0);
    }
    setIsSwipeIntent(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    setIsDragging(true);
    setIsSwipeIntent(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diffX = e.clientX - startX.current;
    const diffY = e.clientY - startY.current;
    
    if (!isSwipeIntent && Math.abs(diffY) > Math.abs(diffX)) {
      setIsDragging(false);
      setOffset(0);
      return;
    }
    
    if (!isSwipeIntent && Math.abs(diffX) < SWIPE_THRESHOLD) return;
    if (!isSwipeIntent) setIsSwipeIntent(true);
    
    if (diffX > 0) {
      setOffset(Math.min(diffX - SWIPE_THRESHOLD, 140));
    } else {
      setOffset(Math.max(0, offset + diffX * 0.3));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (offset > SNAP_THRESHOLD) {
      setOffset(140);
    } else {
      setOffset(0);
    }
    setIsSwipeIntent(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsSwipeIntent(false);
      if (offset > SNAP_THRESHOLD) {
        setOffset(140);
      } else {
        setOffset(0);
      }
    }
  };

  const resetSwipe = useCallback(() => {
    setOffset(0);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
      onMouseLeave={handleMouseLeave}
    >
      {/* Actions on the LEFT side (revealed by swiping RIGHT in RTL) */}
      <div 
        className="absolute inset-y-0 left-0 flex items-stretch z-10"
        style={{ 
          opacity: offset > 0 ? 1 : 0,
          transition: isDragging ? 'none' : 'opacity 0.2s ease'
        }}
      >
        <button
          onClick={() => {
            onEdit(transaction);
            resetSwipe();
          }}
          className="w-[60px] sm:w-[70px] flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors touch-target"
        >
          <Edit3 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={() => {
            onDelete(transaction.id);
            resetSwipe();
          }}
          className="w-[60px] sm:w-[70px] flex items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 transition-colors touch-target"
        >
          <Trash2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Transaction item - moves RIGHT to reveal actions */}
      <div
        className={cn(
          "relative bg-card transition-transform",
          !isDragging && "duration-200 ease-out"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <TransactionItem 
          transaction={transaction} 
          onClick={() => offset === 0 && onEdit(transaction)}
        />
      </div>
    </div>
  );
}

export const SwipeableTransaction = memo(SwipeableTransactionComponent);
