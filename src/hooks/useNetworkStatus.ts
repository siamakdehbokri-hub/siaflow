/**
 * Hook: global network & sync status for UI indicators.
 * Invalidates React Query cache after successful sync.
 * Listens to both app-level sync and SW Background Sync messages.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { processQueue, onSyncStatusChange, onSyncComplete, type SyncStatus } from '@/lib/syncManager';
import { getPendingCount, getFailedCount, subscribeToOfflineQueue } from '@/lib/offlineDb';

export type NetworkState = 'online' | 'offline' | 'syncing';

export function useNetworkStatus(manageSync = true) {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const queryClient = useQueryClient();

  const refreshPendingCount = useCallback(async () => {
    const [count, failed] = await Promise.all([getPendingCount(), getFailedCount()]);
    setPendingCount(count);
    setFailedCount(failed);
    return count;
  }, []);

  // Listen to browser online/offline events
  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      if (manageSync) void processQueue();
    };
    const goOffline = () => {
      setOnline(false);
      refreshPendingCount();
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [refreshPendingCount, manageSync]);

  // Listen to sync status changes
  useEffect(() => {
    const unsub = onSyncStatusChange((status, pending) => {
      setSyncStatus(status);
      setPendingCount(pending);
    });
    return () => { unsub(); };
  }, []);

  // Invalidate all queries when sync completes
  useEffect(() => {
    if (!manageSync) return;
    const unsub = onSyncComplete(() => {
      queryClient.invalidateQueries();
    });
    return () => { unsub(); };
  }, [queryClient, manageSync]);

  // Listen for SW Background Sync completion messages
  useEffect(() => {
    if (!manageSync) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        void processQueue();
        refreshPendingCount();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, [queryClient, refreshPendingCount, manageSync]);

  // Initial pending count + resume sync when app opens online
  useEffect(() => {
    refreshPendingCount().then((count) => {
      if (manageSync && navigator.onLine && count > 0) {
        processQueue();
      }
    });

    const unsubscribe = subscribeToOfflineQueue(() => {
      refreshPendingCount();
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        refreshPendingCount().then((count) => {
          if (manageSync && count > 0) void processQueue();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshPendingCount, manageSync]);

  const networkState: NetworkState = !online
    ? 'offline'
    : syncStatus === 'syncing'
    ? 'syncing'
    : 'online';

  const manualSync = useCallback(() => {
    if (navigator.onLine) processQueue();
  }, []);

  return {
    online,
    networkState,
    syncStatus,
    pendingCount,
    failedCount,
    manualSync,
  };
}
