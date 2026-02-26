import { Home, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onNavigateHome: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminHeader({ onNavigateHome, onRefresh, isLoading }: AdminHeaderProps) {
  return (
    <div className="glass-heavy rounded-2xl p-4 space-y-3">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-bold text-base text-foreground">کنترل سیستم</h1>
            <p className="text-xs text-muted-foreground">مدیریت و نظارت</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateHome}
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 bg-success/10 text-success border border-success/20 rounded-lg px-3 py-1.5 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        سیستم فعال
      </div>
    </div>
  );
}
