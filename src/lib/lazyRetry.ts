/**
 * Lazy import with automatic retry for "Importing a module script failed" errors.
 * On failure, clears module cache and retries up to `maxRetries` times.
 * After all retries fail, forces a page reload (once) to bust stale SW/cache.
 */
export function lazyRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries = 2,
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    const attempt = (retriesLeft: number) => {
      importFn()
        .then(resolve)
        .catch((error: Error) => {
          if (retriesLeft > 0) {
            // Wait a bit and retry
            setTimeout(() => attempt(retriesLeft - 1), 1000);
          } else {
            // All retries failed — try a hard reload once
            const hasReloaded = sessionStorage.getItem('module-reload');
            if (!hasReloaded) {
              sessionStorage.setItem('module-reload', '1');
              window.location.reload();
            } else {
              sessionStorage.removeItem('module-reload');
              reject(error);
            }
          }
        });
    };
    attempt(maxRetries);
  });
}

/**
 * Named-export variant: wraps modules that use named exports.
 */
export function lazyRetryNamed<T extends React.ComponentType<any>>(
  importFn: () => Promise<Record<string, any>>,
  exportName: string,
  maxRetries = 2,
): Promise<{ default: T }> {
  return lazyRetry(
    () => importFn().then(mod => ({ default: mod[exportName] as T })),
    maxRetries,
  );
}
