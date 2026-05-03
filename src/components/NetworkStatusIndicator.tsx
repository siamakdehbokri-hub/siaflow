import { useNetworkStatus, type NetworkState } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function NetworkStatusIndicator() {
  const { networkState, pendingCount, failedCount } = useNetworkStatus();
  const prevState = useRef<NetworkState>(networkState);
  const prevFailed = useRef(failedCount);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show on state change, auto-hide when online
  useEffect(() => {
    if (prevState.current === networkState) return;
    const prev = prevState.current;
    prevState.current = networkState;

    setVisible(true);
    clearTimeout(hideTimer.current);

    if (networkState === 'offline') {
      toast.info('تغییرات آفلاین ذخیره می‌شوند', { duration: 3000 });
    } else if (networkState === 'syncing' && prev === 'offline') {
      toast.info('در حال همگام‌سازی...', { duration: 2000 });
    } else if (networkState === 'online' && prev !== 'online') {
      toast.success('همگام‌سازی کامل شد', { duration: 2000 });
      hideTimer.current = setTimeout(() => setVisible(false), 3000);
    }
  }, [networkState]);

  // Surface permanently failed items so they don't fail silently
  useEffect(() => {
    if (failedCount > prevFailed.current) {
      toast.error(`${failedCount} تغییر آفلاین ذخیره نشد. لطفاً دوباره تلاش کنید.`, {
        duration: 6000,
      });
    }
    prevFailed.current = failedCount;
  }, [failedCount]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Only show when offline/syncing or briefly after reconnect
  const shouldShow = visible || networkState !== 'online';
  if (!shouldShow && pendingCount === 0 && failedCount === 0) return null;

  const Icon = networkState === 'online' ? Wifi : networkState === 'offline' ? WifiOff : RefreshCw;
  const label = networkState === 'online' ? 'آنلاین' : networkState === 'offline' ? 'آفلاین' : 'همگام‌سازی...';

  return (
    <div
      className={cn(
        "fixed top-[env(safe-area-inset-top,0px)] inset-x-0 z-50",
        "flex items-center justify-center transition-all duration-300 ease-out",
        "pointer-events-none",
        shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
      <div
        className={cn(
          "mt-2 flex items-center gap-1.5 rounded-full px-3 py-1",
          "text-[11px] font-medium shadow-lg pointer-events-auto",
          "backdrop-blur-xl border transition-colors duration-300",
          networkState === 'online' && "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
          networkState === 'offline' && "bg-red-500/15 text-red-400 border-red-500/20",
          networkState === 'syncing' && "bg-amber-500/15 text-amber-400 border-amber-500/20"
        )}
      >
        {/* Status dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-60",
            networkState !== 'online' && 'animate-ping',
            networkState === 'online' && "bg-emerald-400",
            networkState === 'offline' && "bg-red-400",
            networkState === 'syncing' && "bg-amber-400"
          )} />
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            networkState === 'online' && "bg-emerald-400",
            networkState === 'offline' && "bg-red-400",
            networkState === 'syncing' && "bg-amber-400"
          )} />
        </span>

        <Icon className={cn("w-3 h-3 shrink-0", networkState === 'syncing' && 'animate-spin')} />
        <span className="whitespace-nowrap">{label}</span>

        {pendingCount > 0 && (
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] tabular-nums font-bold",
            networkState === 'online' && "bg-emerald-400/20",
            networkState === 'offline' && "bg-red-400/20",
            networkState === 'syncing' && "bg-amber-400/20"
          )}>
            {pendingCount}
          </span>
        )}
      </div>
    </div>
  );
}
