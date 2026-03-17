import { useNetworkStatus, type NetworkState } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const stateConfig: Record<NetworkState, { icon: typeof Wifi; label: string; color: string }> = {
  online: { icon: Wifi, label: 'آنلاین', color: 'emerald' },
  offline: { icon: WifiOff, label: 'آفلاین', color: 'red' },
  syncing: { icon: RefreshCw, label: 'همگام‌سازی...', color: 'amber' },
};

export function NetworkStatusIndicator() {
  const { networkState, pendingCount } = useNetworkStatus();
  const prevState = useRef<NetworkState>(networkState);
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

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Only show when offline/syncing or briefly after reconnect
  const shouldShow = visible || networkState !== 'online';
  if (!shouldShow && pendingCount === 0) return null;

  const { icon: Icon, label, color } = stateConfig[networkState];

  return (
    <div
      className={`fixed top-[env(safe-area-inset-top,0px)] inset-x-0 z-50
        flex items-center justify-center transition-all duration-300 ease-out
        ${shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        pointer-events-none`}
    >
      <div
        className={`mt-2 flex items-center gap-1.5 rounded-full px-3 py-1
          text-[11px] font-medium shadow-lg pointer-events-auto
          backdrop-blur-xl border transition-colors duration-300
          bg-${color}-500/15 text-${color}-400 border-${color}-500/20`}
      >
        {/* Status dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60
            ${networkState !== 'online' ? 'animate-ping' : ''} bg-${color}-400`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 bg-${color}-400`} />
        </span>

        <Icon className={`w-3 h-3 shrink-0 ${networkState === 'syncing' ? 'animate-spin' : ''}`} />
        <span className="whitespace-nowrap">{label}</span>

        {pendingCount > 0 && (
          <span className={`bg-${color}-400/20 rounded-full px-1.5 py-0.5 text-[9px] tabular-nums font-bold`}>
            {pendingCount}
          </span>
        )}
      </div>
    </div>
  );
}
