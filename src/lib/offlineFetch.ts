/**
 * Offline-aware fetch wrapper.
 * For mutations (POST/PUT/DELETE/PATCH): if offline, queues to IndexedDB.
 * For reads (GET): passes through normally (SW handles caching).
 */

import { enqueueRequest } from './offlineDb';
import { processQueue } from './syncManager';

const MUTATION_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Wraps a Supabase REST call. If the network is down and it's a mutation,
 * the request is queued for later sync instead of failing.
 *
 * Returns { queued: true } when offline-queued, otherwise the normal response.
 */
export async function offlineFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();

  // GET requests – let browser + SW handle it
  if (!MUTATION_METHODS.includes(method)) {
    return fetch(url, options);
  }

  // Mutation request – try online first
  if (navigator.onLine) {
    try {
      const res = await fetch(url, options);
      // If fetch succeeded, also try to flush any queued items
      if (res.ok) {
        processQueue().catch(() => {}); // fire-and-forget
      }
      return res;
    } catch (err) {
      // Network error despite onLine – fall through to queue
      if (!(err instanceof TypeError)) throw err;
    }
  }

  // Offline or network failure – queue the request
  let payload: unknown = undefined;
  if (options.body) {
    try {
      payload = JSON.parse(options.body as string);
    } catch {
      payload = options.body;
    }
  }

  // Extract relevant headers (auth, content-type)
  const headers: Record<string, string> = {};
  if (options.headers) {
    const h = options.headers as Record<string, string>;
    if (h['Authorization'] || h['authorization']) {
      headers['Authorization'] = h['Authorization'] || h['authorization'];
    }
    if (h['apikey']) {
      headers['apikey'] = h['apikey'];
    }
  }

  await enqueueRequest({
    endpoint: url,
    method: method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    payload,
    headers,
  });

  // Return a synthetic "accepted" response so callers don't crash
  return new Response(JSON.stringify({ offline_queued: true }), {
    status: 202,
    statusText: 'Accepted (Offline Queued)',
    headers: { 'Content-Type': 'application/json' },
  });
}
