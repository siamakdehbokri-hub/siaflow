import { Home, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onNavigateHome: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminHeader({ onNavigateHome, onRefresh, isLoading }: AdminHeaderProps) {
  return (
    <div className="bg-slate-800 text-white rounded-2xl p-4 space-y-3">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-slate-300" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-bold text-base">پنل مدیریت</h1>
            <p className="text-xs text-slate-400">کنترل سیستم</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-10 w-10 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateHome}
            className="h-10 w-10 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
      
      {/* Status Badge */}
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 rounded-lg text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2 animate-pulse" />
        سیستم فعال
      </Badge>
    </div>
  );
}
