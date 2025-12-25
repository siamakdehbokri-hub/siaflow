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

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX.current - currentX;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      setOffset(Math.min(diff, 140));
    } else {
      setOffset(Math.max(diff, 0));
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
    const diff = startX.current - e.clientX;
    if (diff > 0) {
      setOffset(Math.min(diff, 140));
    } else {
      setOffset(Math.max(diff, 0));
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

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
      onMouseLeave={handleMouseLeave}
    >
      {/* Actions behind */}
      <div className="absolute inset-y-0 left-0 flex items-stretch">
        <button
          onClick={() => onEdit(transaction)}
          className="w-[70px] flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="w-[70px] flex items-center justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Transaction item */}
      <div
        className={cn(
          "relative bg-card transition-transform",
          !isDragging && "duration-200"
        )}
        style={{ transform: `translateX(-${offset}px)` }}
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
