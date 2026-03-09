/**
 * SyncManager – processes the offline queue when connectivity returns.
 * Uses exponential backoff and prevents duplicate submissions.
 */

import {
  getPendingRequests,
  updateQueuedRequest,
  removeQueuedRequest,
  type QueuedRequest,
} from './offlineDb';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

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

/** Process the offline queue sequentially */
export async function processQueue(): Promise<void> {
  if (isSyncing) return; // prevent concurrent runs
  if (!navigator.onLine) return;

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
    try {
      await replayRequest(item);
      await removeQueuedRequest(item.id!);
      remaining--;
      emit('syncing', remaining);
    } catch (err) {
      const newRetry = item.retryCount + 1;
      if (newRetry >= MAX_RETRIES) {
        // Give up on this item
        await updateQueuedRequest(item.id!, {
          status: 'failed',
          retryCount: newRetry,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        });
        remaining--;
        console.error(`[SyncManager] Permanently failed after ${MAX_RETRIES} retries:`, item.endpoint);
      } else {
        await updateQueuedRequest(item.id!, {
          retryCount: newRetry,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        });
        // Exponential backoff – wait before next attempt
        const delay = BASE_DELAY_MS * Math.pow(2, newRetry);
        await sleep(delay);
      }
    }
  }

  isSyncing = false;
  emit(remaining === 0 ? 'done' : 'error', remaining);

  // Auto-clear 'done' status after 3s
  if (remaining === 0) {
    setTimeout(() => {
      if (currentStatus === 'done') emit('idle', 0);
    }, 3000);
  }
}

/** Replay a single queued request against the real server */
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
    // Conflict detection
    if (response.status === 409) {
      console.warn(`[SyncManager] Conflict on ${item.endpoint}:`, text);
    }
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
