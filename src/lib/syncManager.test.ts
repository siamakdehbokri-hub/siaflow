import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pending: vi.fn(), update: vi.fn(), remove: vi.fn(), session: vi.fn(),
}));
vi.mock('./offlineDb', () => ({
  getPendingRequests: mocks.pending,
  updateQueuedRequest: mocks.update,
  removeQueuedRequest: mocks.remove,
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { getSession: mocks.session } },
}));
import { processQueue, getSyncStatus, onSyncComplete } from './syncManager';

const item = (id: number) => ({ id, endpoint: '/rest/v1/transactions', method: 'DELETE', payload: null, timestamp: id, retryCount: 0, status: 'pending' });

describe('offline sync recovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    mocks.update.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
    mocks.session.mockResolvedValue({ data: { session: { access_token: 'test-token' } } });
  });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('unlocks after queue storage fails so a later pass succeeds', async () => {
    mocks.pending.mockRejectedValueOnce(new Error('storage unavailable')).mockResolvedValueOnce([]);
    await processQueue();
    expect(getSyncStatus()).toBe('error');
    await processQueue();
    expect(mocks.pending).toHaveBeenCalledTimes(2);
    expect(getSyncStatus()).toBe('idle');
  });

  it('aborts a stalled request and preserves it without sending dependent deletes', async () => {
    mocks.pending.mockResolvedValue([item(1), item(2)]);
    const fetchMock = vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason));
    }));
    vi.stubGlobal('fetch', fetchMock);
    const pass = processQueue();
    await vi.advanceTimersByTimeAsync(15001);
    await pass;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenLastCalledWith(1, expect.objectContaining({ status: 'pending', retryCount: 1 }));
    expect(getSyncStatus()).toBe('error');
  });

  it('resolves auth once and signals a single completion for successful deletes', async () => {
    mocks.pending.mockResolvedValue([item(1), item(2)]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const complete = vi.fn();
    const unsubscribe = onSyncComplete(complete);
    await Promise.all([processQueue(), processQueue()]);
    expect(mocks.session).toHaveBeenCalledTimes(1);
    expect(mocks.remove.mock.calls).toEqual([[1], [2]]);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(getSyncStatus()).toBe('done');
    unsubscribe();
  });

  it('keeps expired-session failures queued rather than losing changes', async () => {
    mocks.pending.mockResolvedValue([item(1)]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));
    await processQueue();
    expect(mocks.update).toHaveBeenLastCalledWith(1, expect.objectContaining({ status: 'pending' }));
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});