/**
 * SyncManager – processes the offline queue when connectivity returns.
 * Uses exponential backoff, dedup via processing status, and conflict logging.
 * Also triggers Background Sync API when available.
 */

import {
  getPendingRequests,
  updateQueuedRequest,
  removeQueuedRequest,
  type QueuedRequest,
} from './offlineDb';
import { fetchWithTimeout, withTimeout, requestBackgroundSync } from './requestTimeout';

const MAX_RETRIES = 5;

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

type SyncListener = (status: SyncStatus, pending: number) => void;
type SyncCompleteCallback = () => void;

const listeners = new Set<SyncListener>();
const completeCallbacks = new Set<SyncCompleteCallback>();
let currentStatus: SyncStatus = 'idle';
let isSyncing = false;

export function onSyncStatusChange(fn: SyncListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(status: SyncStatus, pending: number) {
  currentStatus = status;
  listeners.forEach((fn) => fn(status, pending));
}

export function getSyncStatus() {
  return currentStatus;
}

/** Register a callback that fires when sync completes successfully */
export function onSyncComplete(fn: SyncCompleteCallback) {
  completeCallbacks.add(fn);
  return () => completeCallbacks.delete(fn);
}

/** Process the offline queue sequentially (prevents race conditions) */
export async function processQueue(): Promise<void> {
  if (isSyncing) return;
  if (!navigator.onLine) {
    await requestBackgroundSync();
    return;
  }

  isSyncing = true;
  let remaining = 0;
  let synced = 0;
  try {
  const pending = await getPendingRequests();

  if (pending.length === 0) {
    isSyncing = false;
    emit('idle', 0);
    return;
  }

  emit('syncing', pending.length);
  remaining = pending.length;
  // Resolve auth once per pass, not once for every queued item.
  const { supabase } = await import('@/integrations/supabase/client');
  const { data } = await withTimeout(supabase.auth.getSession());
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('No active session — will retry');
  const deadline = Date.now() + 30000;

  for (const item of pending) {
    if (!navigator.onLine || Date.now() >= deadline) break;
    if (item.id === undefined) continue;
    // Skip items already in terminal failed state — they need user action
    if (item.status === 'failed') {
      remaining--;
      continue;
    }

    // Mark as processing to prevent duplicate pickup
    await updateQueuedRequest(item.id, { status: 'processing' as QueuedRequest['status'] });

    try {
      await replayRequest(item, accessToken);
      await removeQueuedRequest(item.id);
      remaining--;
      synced++;
      emit('syncing', remaining);
    } catch (err) {
      const isPermanent = err instanceof Error && err.message.startsWith('PERMANENT:');
      const newRetry = item.retryCount + 1;

      if (isPermanent || newRetry >= MAX_RETRIES) {
        // Terminal failure — surface to user, do NOT retry forever
        await updateQueuedRequest(item.id, {
          status: 'failed',
          retryCount: newRetry,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        });
        remaining--;
        if (isPermanent) {
          console.error(`[SyncManager] Permanent failure on ${item.endpoint}:`, err.message);
        } else {
          console.error(`[SyncManager] Permanently failed after ${MAX_RETRIES} retries:`, item.endpoint);
        }
      } else {
        // Transient failure — reset to pending and let the NEXT processQueue
        // (online event / SW SYNC_COMPLETE / manual trigger) retry it.
        // We intentionally do NOT sleep here: sleeping inside the loop would
        // stall every following item in the queue for up to MAX_DELAY_MS.
        await updateQueuedRequest(item.id, {
          status: 'pending',
          retryCount: newRetry,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        });
        // Do not send later dependent mutations after a network failure.
        break;
      }
    }
  }

  emit(remaining === 0 ? 'done' : 'error', remaining);

  if (synced > 0) {
    completeCallbacks.forEach((fn) => fn());
  }
  if (remaining === 0) {
    setTimeout(() => {
      if (currentStatus === 'done') emit('idle', 0);
    }, 3000);
  }
  } catch (error) {
    console.error('[SyncManager] Sync interrupted:', error);
    emit('error', remaining);
  } finally {
    // IndexedDB, session, or listener errors must never lock future syncs.
    isSyncing = false;
  }
}

/** Replay a single queued request — attaches a fresh bearer token at send time */
async function replayRequest(item: QueuedRequest, accessToken: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(item.headers || {}),
  };
  // Strip any stale Authorization header that may have been persisted by older versions
  delete headers['Authorization'];
  delete headers['authorization'];
  headers['Authorization'] = `Bearer ${accessToken}`;

  const response = await fetchWithTimeout(item.endpoint, {
    method: item.method,
    headers,
    body: item.payload ? JSON.stringify(item.payload) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    // Conflict detection & logging
    if (response.status === 409) {
      console.warn(`[SyncManager] Conflict on ${item.endpoint}`);
      throw new Error(`PERMANENT: CONFLICT: ${text}`);
    }

    // 400/401/403/404/422 = permanent — do not retry forever
    if ([400, 403, 404, 422].includes(response.status)) {
      throw new Error(`PERMANENT: HTTP ${response.status}: ${text}`);
    }

    throw new Error(`HTTP ${response.status}: ${text}`);
  }
}
