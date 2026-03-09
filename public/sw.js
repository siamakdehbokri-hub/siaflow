/**
 * SiaFlow Service Worker – Production-ready offline-first architecture.
 *
 * Strategies:
 *   - Static assets → Cache First (with versioned cache name)
 *   - API GET       → Network First (fallback to cache)
 *   - API Mutations  → Network only (offline queuing handled by app-layer IndexedDB)
 *   - Fonts         → Cache First (1 year)
 *   - Navigation    → Network First (fallback to cached shell)
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `siaflow-static-${CACHE_VERSION}`;
const API_CACHE = `siaflow-api-${CACHE_VERSION}`;
const FONT_CACHE = `siaflow-fonts-${CACHE_VERSION}`;

const SUPABASE_ORIGIN = 'supabase.co';

// Static asset extensions
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff2', '.woff', '.webp'];

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/favicon.png',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== FONT_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (mutations handled by app-layer offlineFetch)
  if (request.method !== 'GET') return;

  // Never cache OAuth redirects
  if (url.pathname.startsWith('/~oauth')) return;

  // Font requests → Cache First (long-lived)
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('cdnfonts.com')) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Supabase API GET requests → Network First
  if (url.hostname.includes(SUPABASE_ORIGIN)) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // Static assets → Cache First
  if (STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation requests → Network First (SPA shell fallback)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, STATIC_CACHE, 3000));
    return;
  }
});

// Background Sync registration
self.addEventListener('sync', (event) => {
  if (event.tag === 'siaflow-sync') {
    event.waitUntil(notifyClientsToSync());
  }
});

/**
 * Cache First: check cache, fall back to network & cache the response.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First: try network with timeout, fall back to cache.
 */
async function networkFirst(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Tell all clients to trigger sync processing.
 */
async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_REQUESTED' });
  });
}
