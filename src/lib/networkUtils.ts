/**
 * Network error detection helpers shared across offline-aware mutations.
 */

export function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) return true;
  if (err.name === 'AbortError') return true;
  if (err.name === 'NetworkError') return true;
  const networkCodes = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ERR_NETWORK'];
  const code = (err as { code?: string }).code;
  if (code && networkCodes.includes(code)) return true;
  return false;
}

/** True when the current environment is offline OR the error looks like a network failure */
export function shouldQueueOffline(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  return isNetworkError(err);
}

export const OFFLINE_PENDING_PREFIX = 'offline-';

export function isOfflineId(id: string | undefined | null): boolean {
  return typeof id === 'string' && id.startsWith(OFFLINE_PENDING_PREFIX);
}
