/**
 * React Query cache persistence to localStorage.
 * Saves query data so the app works after refresh while offline.
 *
 * SECURITY: Cache is scoped per user id. On user change/logout the previous
 * user's cache is cleared so financial data never leaks across accounts.
 */

import type { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CACHE_PREFIX = 'siaflow-query-cache:';
const ACTIVE_USER_KEY = 'siaflow-cache-active-user';
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

function cacheKeyFor(userId: string | null) {
  return userId ? `${CACHE_PREFIX}${userId}` : null;
}

function clearStaleCaches(activeUserId: string | null) {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(CACHE_PREFIX)) continue;
      if (!activeUserId || k !== `${CACHE_PREFIX}${activeUserId}`) {
        localStorage.removeItem(k);
      }
    }
  } catch {
    // ignore
  }
}

let currentUserId: string | null = null;

/** Persist relevant query data to localStorage, scoped per user */
export function persistQueryCache(queryClient: QueryClient) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (!currentUserId) return; // never persist for anonymous sessions
    const key = cacheKeyFor(currentUserId);
    if (!key) return;
    try {
      const queries = queryClient.getQueryCache().getAll();
      const serializable: Array<{ key: readonly unknown[]; data: unknown; updatedAt: number }> = [];

      for (const query of queries) {
        if (query.state.status === 'success' && query.state.data !== undefined) {
          serializable.push({
            key: query.queryKey,
            data: query.state.data,
            updatedAt: query.state.dataUpdatedAt,
          });
        }
      }

      localStorage.setItem(key, JSON.stringify(serializable));
      localStorage.setItem(ACTIVE_USER_KEY, currentUserId);
    } catch {
      // localStorage full or other error
    }
  };

  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 2000);
  });

  // Track auth state — clear cache on user change/logout
  const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
    const newUserId = session?.user?.id ?? null;
    if (newUserId !== currentUserId) {
      // Drop the in-memory query cache so the next user never sees stale data
      queryClient.clear();
      clearStaleCaches(newUserId);
      currentUserId = newUserId;
    }
  });

  // Initialize
  supabase.auth.getSession().then(({ data }) => {
    currentUserId = data.session?.user?.id ?? null;
    clearStaleCaches(currentUserId);
  });

  const handlePageHide = () => {
    if (timer) clearTimeout(timer);
    flush();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') handlePageHide();
  };

  window.addEventListener('pagehide', handlePageHide);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    if (timer) clearTimeout(timer);
    handlePageHide();
    window.removeEventListener('pagehide', handlePageHide);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    unsubscribe();
    authSub.subscription.unsubscribe();
  };
}

/** Restore query cache from localStorage, scoped per user */
export function restoreQueryCache(queryClient: QueryClient) {
  try {
    // Drop legacy unscoped cache from older versions
    localStorage.removeItem('siaflow-query-cache');

    const activeUser = localStorage.getItem(ACTIVE_USER_KEY);
    if (!activeUser) return;
    const key = cacheKeyFor(activeUser);
    if (!key) return;

    const raw = localStorage.getItem(key);
    if (!raw) return;

    const entries = JSON.parse(raw) as Array<{
      key: unknown[];
      data: unknown;
      updatedAt: number;
    }>;

    const now = Date.now();
    for (const entry of entries) {
      if (now - entry.updatedAt > MAX_AGE) continue;
      queryClient.setQueryData(entry.key as string[], entry.data);
    }
  } catch {
    // Corrupted cache — ignore; clearStaleCaches will run after auth check
  }
}
