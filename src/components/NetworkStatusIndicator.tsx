import { useNetworkStatus, type NetworkState } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const config: Record<NetworkState, { icon: typeof Wifi; label: string; dotColor: string; bgClass: string }> = {
  online: {
    icon: Wifi,
    label: 'آنلاین',
    dotColor: 'bg-emerald-400',
    bgClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  },
  offline: {
    icon: WifiOff,
    label: 'آفلاین — ذخیره محلی',
    dotColor: 'bg-red-400',
    bgClass: 'bg-red-500/15 text-red-400 border-red-500/25',
  },
  syncing: {
    icon: RefreshCw,
    label: 'در حال همگام‌سازی...',
    dotColor: 'bg-amber-400',
    bgClass: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  },
};

export function NetworkStatusIndicator() {
  const { networkState, pendingCount } = useNetworkStatus();
  const prevState = useRef<NetworkState>(networkState);
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show toast on state change & auto-expand
  useEffect(() => {
    if (prevState.current === networkState) return;
    const prev = prevState.current;
    prevState.current = networkState;

    // Expand the indicator for a few seconds on change
    setExpanded(true);
    clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setExpanded(false), 4000);

    if (networkState === 'offline') {
      toast.info('اینترنت قطع شد. تغییرات به صورت آفلاین ذخیره می‌شوند.', { duration: 4000 });
    } else if (networkState === 'syncing' && prev === 'offline') {
      toast.info('اینترنت وصل شد. در حال همگام‌سازی...', { duration: 3000 });
    } else if (networkState === 'online' && prev === 'syncing') {
      toast.success('همه تغییرات با موفقیت همگام‌سازی شدند.', { duration: 3000 });
    }
  }, [networkState]);

  // Cleanup
  useEffect(() => () => clearTimeout(collapseTimer.current), []);

  const { icon: Icon, label, dotColor, bgClass } = config[networkState];
  const showLabel = expanded || networkState !== 'online';

  return (
    <button
      onClick={() => setExpanded(e => !e)}
      className={`fixed bottom-[calc(env(safe-area-inset-bottom,0px)+70px)] left-4 z-40
        flex items-center gap-1.5 rounded-full border backdrop-blur-xl
        text-[10px] font-medium shadow-md cursor-pointer
        transition-all duration-500 ease-out
        ${bgClass}
        ${showLabel ? 'px-3 py-1' : 'px-1.5 py-1'}`}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75
          ${networkState !== 'online' ? 'animate-ping' : ''}
          ${dotColor}`}
        />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
      </span>

      {/* Icon */}
      <Icon className={`w-2.5 h-2.5 shrink-0 ${networkState === 'syncing' ? 'animate-spin' : ''}`} />

      {/* Label */}
      {showLabel && (
        <span className="whitespace-nowrap">{label}</span>
      )}

      {/* Pending count badge */}
      {pendingCount > 0 && (
        <span className="bg-foreground/10 rounded-full px-1 py-0.5 text-[8px] tabular-nums">
          {pendingCount}
        </span>
      )}
    </button>
  );
}
