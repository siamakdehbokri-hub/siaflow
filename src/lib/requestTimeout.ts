/** Bounds work without leaving timers alive after a successful request. */
export function withTimeout<T>(work: PromiseLike<T>, timeoutMs = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DOMException('Request timed out', 'TimeoutError')), timeoutMs);
    Promise.resolve(work).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}

/** `ready` never resolves when no service worker is installed (including preview). */
export async function requestBackgroundSync(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration && 'sync' in registration) {
      await withTimeout((registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      }).sync.register('offline-mutations'), 2000);
    }
  } catch {
    // Foreground sync is the fallback; optional registration cannot block saving.
  }
}