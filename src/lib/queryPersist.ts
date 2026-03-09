/**
 * React Query cache persistence to localStorage.
 * Saves query data so the app works after refresh while offline.
 */

import type { QueryClient } from '@tanstack/react-query';

const CACHE_KEY = 'siaflow-query-cache';
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

/** Persist relevant query data to localStorage */
export function persistQueryCache(queryClient: QueryClient) {
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    try {
      const queries = queryClient.getQueryCache().getAll();
      const serializable: Array<{ key: readonly unknown[]; data: unknown; updatedAt: number }> = [];

      for (const query of queries) {
        // Only persist successful queries with data
        if (query.state.status === 'success' && query.state.data !== undefined) {
          serializable.push({
            key: query.queryKey,
            data: query.state.data,
            updatedAt: query.state.dataUpdatedAt,
          });
        }
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(serializable));
    } catch {
      // localStorage full or other error – silently ignore
    }
  });

  return unsubscribe;
}

/** Restore query cache from localStorage */
export function restoreQueryCache(queryClient: QueryClient) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;

    const entries = JSON.parse(raw) as Array<{
      key: unknown[];
      data: unknown;
      updatedAt: number;
    }>;

    const now = Date.now();
    for (const entry of entries) {
      // Skip expired entries
      if (now - entry.updatedAt > MAX_AGE) continue;

      queryClient.setQueryData(entry.key as string[], entry.data);
    }
  } catch {
    // Corrupted cache – clear it
    localStorage.removeItem(CACHE_KEY);
  }
}
