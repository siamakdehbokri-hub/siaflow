/**
 * Hook: global network & sync status for UI indicators.
 * Invalidates React Query cache after successful sync.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { processQueue, onSyncStatusChange, onSyncComplete, type SyncStatus } from '@/lib/syncManager';
import { getPendingCount } from '@/lib/offlineDb';

export type NetworkState = 'online' | 'offline' | 'syncing';

export function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const queryClient = useQueryClient();

  // Listen to browser online/offline events
  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      processQueue();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Listen to sync status changes
  useEffect(() => {
    const unsub = onSyncStatusChange((status, pending) => {
      setSyncStatus(status);
      setPendingCount(pending);
    });
    return () => { unsub(); };
  }, []);

  // Invalidate all queries when sync completes to get fresh server data
  useEffect(() => {
    const unsub = onSyncComplete(() => {
      queryClient.invalidateQueries();
    });
    return () => { unsub(); };
  }, [queryClient]);

  // Initial pending count
  useEffect(() => {
    getPendingCount().then(setPendingCount);
  }, []);

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
    manualSync,
  };
}
