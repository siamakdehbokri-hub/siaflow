import { useState, useRef } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { Transaction } from '@/types/expense';
import { TransactionItem } from './TransactionItem';
import { cn } from '@/lib/utils';

interface SwipeableTransactionProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function SwipeableTransaction({ transaction, onEdit, onDelete }: SwipeableTransactionProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // In RTL layout, swipe RIGHT (positive direction) to reveal actions on LEFT
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current; // RTL: positive diff = swipe right
    
    // Allow right swipe (positive diff) to reveal actions
    if (diff > 0) {
      setOffset(Math.min(diff, 140));
    } else {
      setOffset(Math.max(0, offset + diff * 0.3)); // Allow slight resistance when swiping back
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > 70) {
      setOffset(140);
    } else {
      setOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX.current; // RTL: positive diff = swipe right
    if (diff > 0) {
      setOffset(Math.min(diff, 140));
    } else {
      setOffset(Math.max(0, offset + diff * 0.3));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (offset > 70) {
      setOffset(140);
    } else {
      setOffset(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (offset > 70) {
        setOffset(140);
      } else {
        setOffset(0);
      }
    }
  };

  const resetSwipe = () => {
    setOffset(0);
  };

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
