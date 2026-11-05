/**
 * Offline-aware mutation helper for Supabase operations.
 * When offline: performs optimistic update + queues for later sync.
 * When online: executes normally, with fallback to queue on network error.
 *
 * SECURITY: Bearer tokens are NEVER persisted to the offline queue.
 * The current session token is attached at replay time by syncManager.
 */

import { enqueueRequest } from './offlineDb';
import { isNetworkError } from './networkUtils';
import { toast } from 'sonner';
import { fetchWithTimeout, requestBackgroundSync, withTimeout } from './requestTimeout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface OfflineMutationOptions {
  table: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  filters?: Record<string, string>;
  returning?: boolean;
}

export async function offlineMutation<T = unknown>(
  options: OfflineMutationOptions,
  accessToken?: string
): Promise<{ data: T | null; queued: boolean }> {
  const { table, method, filters, returning } = options;

  // Idempotency: give POSTs a client-generated id so a replay after a lost
  // response inserts the same row (ignored as duplicate) instead of a copy.
  const body = method === 'POST' && options.body && options.body.id == null
    ? { ...options.body, id: crypto.randomUUID() }
    : options.body;
  const prefer = method === 'POST'
    ? 'return=representation,resolution=ignore-duplicates'
    : 'return=representation';

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => params.append(key, value));
  }
  if (returning !== false) params.append('select', '*');
  const paramStr = params.toString();
  if (paramStr) url += `?${paramStr}`;

  // Headers used for the live request only — do NOT persist Authorization.
  const liveHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Prefer': 'return=representation',
  };
  if (accessToken) liveHeaders['Authorization'] = `Bearer ${accessToken}`;

  if (navigator.onLine) {
    try {
      const res = await fetchWithTimeout(url, {
        method,
        headers: liveHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      if (method === 'POST' || method === 'PATCH') {
        const data = await res.json().catch(() => null);
        return { data: Array.isArray(data) ? data[0] : data, queued: false };
      }
      return { data: null, queued: false };
    } catch (err) {
      if (isNetworkError(err)) {
        // Fall through to queue
      } else {
        throw err;
      }
    }
  }

  // Offline – queue WITHOUT bearer token. apikey is a public publishable key.
  const queuedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Prefer': 'return=representation',
  };

  await enqueueRequest({
    endpoint: url,
    method,
    payload: body || null,
    headers: queuedHeaders,
  });

  // Try Background Sync registration
  void requestBackgroundSync();

  toast.info('ذخیره آفلاین شد. پس از اتصال همگام‌سازی می‌شود.');
  return { data: null, queued: true };
}

export async function getAccessToken(): Promise<string | undefined> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await withTimeout(supabase.auth.getSession());
    return data.session?.access_token;
  } catch {
    return undefined;
  }
}
