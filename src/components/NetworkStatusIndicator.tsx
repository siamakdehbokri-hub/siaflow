import { useNetworkStatus, type NetworkState } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const config: Record<NetworkState, { icon: typeof Wifi; label: string; className: string }> = {
  online: {
    icon: CheckCircle2,
    label: 'همگام‌سازی شد',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  offline: {
    icon: WifiOff,
    label: 'آفلاین — تغییرات ذخیره می‌شوند',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  syncing: {
    icon: RefreshCw,
    label: 'در حال همگام‌سازی...',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
};

export function NetworkStatusIndicator() {
  const { networkState, pendingCount } = useNetworkStatus();
  const prevState = useRef<NetworkState>(networkState);

  useEffect(() => {
    if (prevState.current === networkState) return;
    const prev = prevState.current;
    prevState.current = networkState;

    if (networkState === 'offline') {
      toast.info('اینترنت قطع شد. تغییرات به صورت آفلاین ذخیره می‌شوند.', { duration: 4000 });
    } else if (networkState === 'syncing' && prev === 'offline') {
      toast.info('اینترنت وصل شد. در حال همگام‌سازی...', { duration: 3000 });
    } else if (networkState === 'online' && prev === 'syncing') {
      toast.success('همه تغییرات با موفقیت همگام‌سازی شدند.', { duration: 3000 });
    }
  }, [networkState]);

  // Only show when offline or syncing (or just finished syncing)
  if (networkState === 'online' && pendingCount === 0) return null;

  const { icon: Icon, label, className } = config[networkState];

  return (
    <div
      className={`fixed top-[env(safe-area-inset-top,0px)] left-1/2 -translate-x-1/2 z-50 mt-2
        flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md
        text-xs font-medium transition-all duration-300 shadow-lg ${className}`}
    >
      <Icon
        className={`w-3.5 h-3.5 ${networkState === 'syncing' ? 'animate-spin' : ''}`}
      />
      <span>{label}</span>
      {pendingCount > 0 && (
        <span className="bg-foreground/10 rounded-full px-2 py-0.5 text-[10px]">
          {pendingCount} مورد در صف
        </span>
      )}
    </div>
  );
}
