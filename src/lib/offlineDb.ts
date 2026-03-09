/**
 * IndexedDB helper for offline request queue.
 * Stores pending mutations (POST/PUT/DELETE) when offline,
 * to be replayed by the SyncManager when connectivity returns.
 */

const DB_NAME = 'siaflow-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-requests';

export interface QueuedRequest {
  id?: number; // auto-incremented
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
  errorMessage?: string;
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
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Enqueue a request for later sync */
export async function enqueueRequest(
  req: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount' | 'status'>
): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item: Omit<QueuedRequest, 'id'> = {
      ...req,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
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

/** Update a queued request (e.g. increment retry, change status) */
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
      if (!existing) {
        resolve();
        return;
      }
      store.put({ ...existing, ...updates });
    };
    getReq.onerror = () => reject(getReq.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

/** Remove a successfully synced request */
export async function removeQueuedRequest(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Get count of pending items */
export async function getPendingCount(): Promise<number> {
  const items = await getPendingRequests();
  return items.length;
}

/** Clear all requests (use carefully) */
export async function clearAllRequests(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
