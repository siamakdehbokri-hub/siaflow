/**
 * IndexedDB helper for offline request queue.
 * Stores pending mutations when offline, replayed by SyncManager.
 * Includes deduplication to prevent double submissions.
 */

const DB_NAME = 'siaflow-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-requests';

export interface QueuedRequest {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
  errorMessage?: string;
  idempotencyKey?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('idempotencyKey', 'idempotencyKey', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generate a deterministic idempotency key from the request shape.
 * Prevents duplicate queue entries for the same operation.
 */
function generateIdempotencyKey(
  req: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount' | 'status'>
): string {
  const payloadStr = req.payload ? JSON.stringify(req.payload) : '';
  return `${req.method}:${req.endpoint}:${payloadStr}`;
}

/** Check if an equivalent request is already queued */
async function isDuplicate(key: string): Promise<boolean> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('idempotencyKey');
    const req = index.getAll(key);
    req.onsuccess = () => {
      const matches = (req.result as QueuedRequest[]).filter(
        r => r.status === 'pending' || r.status === 'processing'
      );
      resolve(matches.length > 0);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/** Enqueue a request for later sync (with dedup) */
export async function enqueueRequest(
  req: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount' | 'status'>
): Promise<number> {
  const idempotencyKey = generateIdempotencyKey(req);

  // Prevent duplicate submissions
  const dup = await isDuplicate(idempotencyKey);
  if (dup) {
    console.debug('[OfflineDB] Duplicate request skipped:', idempotencyKey.slice(0, 80));
    return -1;
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item: Omit<QueuedRequest, 'id'> = {
      ...req,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      idempotencyKey,
    };
    const request = store.add(item);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/** Get all pending requests ordered by timestamp */
export async function getPendingRequests(): Promise<QueuedRequest[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => {
      const all = (request.result as QueuedRequest[]).filter(
        (r) => r.status === 'pending' || r.status === 'failed'
      );
      resolve(all);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

/** Update a queued request */
export async function updateQueuedRequest(
  id: number,
  updates: Partial<QueuedRequest>
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) { resolve(); return; }
      store.put({ ...existing, ...updates });
    };
    getReq.onerror = () => reject(getReq.error);
    tx.oncomplete = () => { db.close(); resolve(); };
  });
}

/** Remove a successfully synced request */
export async function removeQueuedRequest(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

/** Get count of pending items */
export async function getPendingCount(): Promise<number> {
  const items = await getPendingRequests();
  return items.length;
}

/** Clear all requests */
export async function clearAllRequests(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}
