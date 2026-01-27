import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AdminCategory } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface MobileCategoryCardProps {
  category: AdminCategory;
  onDelete: (cat: AdminCategory) => void;
}

export function MobileCategoryCard({ category, onDelete }: MobileCategoryCardProps) {
  return (
    <div className="bg-card rounded-xl border-2 border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Color Icon */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color + '20' }}
          >
            <span className="text-lg" style={{ color: category.color }}>●</span>
          </div>

          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-sm truncate">{category.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">{category.userName}</span>
              <Badge variant="outline" className="rounded-lg text-xs">
                {category.type === 'income' ? 'درآمد' : 'هزینه'}
              </Badge>
            </div>
            {category.budget && (
              <p className="font-mono text-xs text-muted-foreground">
                بودجه: {formatCurrency(category.budget)}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category)}
          className="text-destructive hover:text-destructive rounded-xl h-10 w-10 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
