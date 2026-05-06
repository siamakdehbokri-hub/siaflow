/// <reference lib="webworker" />

// Background Sync API types (not yet in lib.webworker)
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}
interface SyncManager {
  register(tag: string): Promise<void>;
}
declare global {
  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }
  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<import('workbox-precaching').PrecacheEntry | string>;
  }
}

/**
 * Custom Service Worker with:
 * - Precaching via Workbox (injected manifest)
 * - Cache First for static assets & fonts
 * - Network First for API GET requests
 * - Mutation interception → IndexedDB queue → Background Sync
 * - Conflict-aware replay with exponential backoff
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// ─── Precaching ─────────────────────────────────────────────
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const navigationHandler = createHandlerBoundToURL('/index.html');
registerRoute(new NavigationRoute(navigationHandler, {
  denylist: [/^\/~oauth/, /^\/api\//],
}));

// ─── Static Asset Caching (Cache First) ─────────────────────
registerRoute(
  /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|ico|webp|woff2?|ttf|eot)$/i,
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname === '/manifest.json',
  new CacheFirst({
    cacheName: 'app-manifest',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// ─── API GET Caching (Network First) ────────────────────────
registerRoute(
  ({ url, request }) =>
    url.hostname.endsWith('.supabase.co') &&
    url.pathname.startsWith('/rest/') &&
    request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 10 * 60 }),
    ],
    networkTimeoutSeconds: 5,
  })
);

// ─── IndexedDB helpers (inline for SW scope) ────────────────
const DB_NAME = 'siaflow-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-requests';

interface QueuedRequest {
  id?: number;
  endpoint: string;
  method: string;
  payload: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  status: string;
  errorMessage?: string;
  idempotencyKey?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('idempotencyKey', 'idempotencyKey', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getPendingRequests(): Promise<QueuedRequest[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => {
      const all = (request.result as QueuedRequest[]).filter(
        r => r.status === 'pending' || r.status === 'failed'
      );
      resolve(all);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function updateItem(id: number, updates: Partial<QueuedRequest>): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) store.put({ ...getReq.result, ...updates });
    };
    getReq.onerror = () => reject(getReq.error);
    tx.oncomplete = () => { db.close(); resolve(); };
  });
}

async function removeItem(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Notify clients so syncManager (in window) handles the queue ───
async function notifyClientsToSync(): Promise<void> {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE' }));
}

// ─── Background Sync event ─────────────────────────────────
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'offline-mutations') {
    event.waitUntil(notifyClientsToSync());
  }
});

// ─── Manual sync trigger from clients ──────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FORCE_SYNC') {
    notifyClientsToSync().catch(console.error);
  }
});

// ─── Mutation interception (POST/PUT/DELETE/PATCH to Supabase) ──────
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept mutations to Supabase REST API
  if (
    !url.hostname.endsWith('.supabase.co') ||
    !url.pathname.startsWith('/rest/') ||
    request.method === 'GET' ||
    request.method === 'HEAD' ||
    request.method === 'OPTIONS'
  ) {
    return; // Let Workbox or browser handle it
  }

  event.respondWith(handleMutation(request));
});

async function handleMutation(request: Request): Promise<Response> {
  try {
    // Try online first
    const response = await fetch(request.clone());
    if (response.ok) {
      // Also try to replay any queued items
      replayQueue().catch(() => {});
    }
    return response;
  } catch (err) {
    // Network failure – queue it
    const body = await request.clone().text().catch(() => '');
    let payload: unknown = null;
    try { payload = JSON.parse(body); } catch { payload = body || null; }

    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => {
      if (['authorization', 'apikey', 'content-type', 'prefer'].includes(k.toLowerCase())) {
        headers[k] = v;
      }
    });

    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add({
        endpoint: request.url,
        method: request.method,
        payload,
        headers,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
        idempotencyKey: `${request.method}:${request.url}:${Date.now()}`,
      });
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    });

    // Register background sync
    try {
      await (self.registration as ServiceWorkerRegistration).sync.register('offline-mutations');
    } catch {
      // Background Sync not supported; will replay on next online event
    }

    return new Response(JSON.stringify({ offline_queued: true }), {
      status: 202,
      statusText: 'Accepted (Offline Queued)',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Activate: claim clients immediately ────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Skip waiting for immediate activation ──────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
