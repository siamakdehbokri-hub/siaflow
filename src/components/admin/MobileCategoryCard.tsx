import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Wallet } from 'lucide-react';
import { AdminCategory } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface MobileCategoryCardProps {
  category: AdminCategory;
  onDelete: (cat: AdminCategory) => void;
}

export function MobileCategoryCard({ category, onDelete }: MobileCategoryCardProps) {
  return (
    <div className="glass rounded-2xl p-4 hover:border-primary/30 transition-all active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color + '15' }}
          >
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          </div>

          <div className="min-w-0 space-y-1.5">
            <p className="font-bold text-sm truncate text-foreground">{category.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">{category.userName}</span>
              <Badge 
                variant="outline" 
                className={`rounded-xl text-xs h-6 px-2 font-medium ${
                  category.type === 'income' 
                    ? 'bg-success/10 text-success border-success/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {category.type === 'income' ? 'درآمد' : 'هزینه'}
              </Badge>
            </div>
            {category.budget && (
              <p className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                <Wallet className="w-3 h-3" strokeWidth={2} /> بودجه: {formatCurrency(category.budget)}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(category)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 w-11 shrink-0 border-destructive/30"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
