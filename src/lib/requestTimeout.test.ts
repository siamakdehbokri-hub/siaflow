import { it, expect, vi, afterEach } from 'vitest';
import { requestBackgroundSync, withTimeout } from './requestTimeout';

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

it('does not wait for a service worker that is never installed', async () => {
  const ready = vi.fn(() => new Promise(() => {}));
  const getRegistration = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {
    get ready() { return ready(); }, getRegistration,
  } });
  await requestBackgroundSync();
  expect(getRegistration).toHaveBeenCalledTimes(1);
  expect(ready).not.toHaveBeenCalled();
});

it('bounds a stalled session wait', async () => {
  vi.useFakeTimers();
  const result = withTimeout(new Promise(() => {}));
  const assertion = expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
  await vi.advanceTimersByTimeAsync(15000);
  await assertion;
});