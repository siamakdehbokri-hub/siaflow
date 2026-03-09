/**
 * Offline-aware mutation helper for Supabase operations.
 * When offline: performs optimistic update + queues for later sync.
 * When online: executes normally, with fallback to queue on network error.
 */

import { enqueueRequest } from './offlineDb';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface OfflineMutationOptions {
  table: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  /** For PATCH/DELETE: query params like eq filters */
  filters?: Record<string, string>;
  /** If true, uses .select() to get data back (for inserts) */
  returning?: boolean;
}

/**
 * Try to execute a Supabase REST mutation.
 * If offline or network fails, queue it and return null.
 * Returns the response data on success, or null if queued.
 */
export async function offlineMutation<T = unknown>(
  options: OfflineMutationOptions,
  accessToken?: string
): Promise<{ data: T | null; queued: boolean }> {
  const { table, method, body, filters, returning } = options;

  // Build URL
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, value);
    });
  }
  if (returning !== false) {
    params.append('select', '*');
  }
  const paramStr = params.toString();
  if (paramStr) url += `?${paramStr}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Try online first
  if (navigator.onLine) {
    try {
      const res = await fetch(url, {
        method,
        headers,
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
      // If it's a network error (not server error), queue it
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Fall through to queue
      } else {
        throw err; // Re-throw server errors
      }
    }
  }

  // Offline – queue the request
  await enqueueRequest({
    endpoint: url,
    method,
    payload: body || null,
    headers,
  });

  toast.info('ذخیره آفلاین شد. پس از اتصال همگام‌سازی می‌شود.');
  return { data: null, queued: true };
}

/**
 * Get current auth token for offline queue headers.
 */
export async function getAccessToken(): Promise<string | undefined> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  } catch {
    return undefined;
  }
}
