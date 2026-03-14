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

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

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

/** Try to register Background Sync via SW */
async function requestBackgroundSync(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg && 'sync' in reg) {
      await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('offline-mutations');
    }
  } catch {
    // Background Sync not available; fall back to manual
  }
}

/** Process the offline queue sequentially (prevents race conditions) */
export async function processQueue(): Promise<void> {
  if (isSyncing) return;
  if (!navigator.onLine) {
    await requestBackgroundSync();
    return;
  }

  isSyncing = true;
  const pending = await getPendingRequests();

  if (pending.length === 0) {
    isSyncing = false;
    emit('idle', 0);
    return;
  }

  emit('syncing', pending.length);
  let remaining = pending.length;

  for (const item of pending) {
    // Mark as processing to prevent duplicate pickup
    await updateQueuedRequest(item.id!, { status: 'processing' as QueuedRequest['status'] });

    try {
      await replayRequest(item);
      await removeQueuedRequest(item.id!);
      remaining--;
      emit('syncing', remaining);
    } catch (err) {
      const newRetry = item.retryCount + 1;
      if (newRetry >= MAX_RETRIES) {
        await updateQueuedRequest(item.id!, {
          status: 'failed',
          retryCount: newRetry,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        });
        remaining--;
        console.error(`[SyncManager] Permanently failed after ${MAX_RETRIES} retries:`, item.endpoint);
      } else {
        await updateQueuedRequest(item.id!, {
          status: 'pending',
          retryCount: newRetry,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        });
        // Exponential backoff with jitter
        const delay = Math.min(BASE_DELAY_MS * Math.pow(2, newRetry) + Math.random() * 500, MAX_DELAY_MS);
        await sleep(delay);
      }
    }
  }

  isSyncing = false;
  emit(remaining === 0 ? 'done' : 'error', remaining);

  if (remaining === 0) {
    completeCallbacks.forEach((fn) => fn());
    setTimeout(() => {
      if (currentStatus === 'done') emit('idle', 0);
    }, 3000);
  }
}

/** Replay a single queued request */
async function replayRequest(item: QueuedRequest): Promise<void> {
  const response = await fetch(item.endpoint, {
    method: item.method,
    headers: {
      'Content-Type': 'application/json',
      ...(item.headers || {}),
    },
    body: item.payload ? JSON.stringify(item.payload) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    // Conflict detection & logging
    if (response.status === 409) {
      console.warn(`[SyncManager] Conflict on ${item.endpoint}:`, text);
      throw new Error(`CONFLICT: ${text}`);
    }

    // 422 = validation error, don't retry
    if (response.status === 422 || response.status === 400) {
      console.error(`[SyncManager] Permanent error ${response.status}:`, text);
      throw new Error(`PERMANENT: HTTP ${response.status}: ${text}`);
    }

    throw new Error(`HTTP ${response.status}: ${text}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
