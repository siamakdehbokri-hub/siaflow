import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminAccount } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/persianDate';

interface MobileAccountCardProps {
  account: AdminAccount;
}

export function MobileAccountCard({ account }: MobileAccountCardProps) {
  const isPositive = account.balance >= 0;

  return (
    <div className="bg-card rounded-xl border-2 border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Color Icon */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: account.color + '20' }}
          >
            <span className="text-lg" style={{ color: account.color }}>●</span>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm truncate">{account.name}</p>
              {account.is_default && (
                <Badge className="bg-primary/10 text-primary rounded-lg text-xs">پیش‌فرض</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {account.userName}
              </span>
              <Badge variant="outline" className="rounded-lg text-xs">
                {account.type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-left">
          <span className={cn(
            "font-mono font-bold text-base",
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(account.balance)}
          </span>
        </div>
      </div>
    </div>
  );
}
