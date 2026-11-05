import { describe, it, expect, vi, beforeEach } from 'vitest';

const enqueueRequest = vi.fn().mockResolvedValue(undefined);
vi.mock('./offlineDb', () => ({ enqueueRequest }));
vi.mock('sonner', () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

import { offlineMutation } from './offlineMutation';

describe('offlineMutation idempotency', () => {
  beforeEach(() => {
    enqueueRequest.mockClear();
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
  });

  it('queues POST with a client-generated id and ignore-duplicates prefer header', async () => {
    await offlineMutation({
      table: 'transactions',
      method: 'POST',
      body: { user_id: 'u1', amount: 100, type: 'saving' },
    });
    const queued = enqueueRequest.mock.calls[0][0];
    expect(queued.payload.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(queued.headers['Prefer']).toContain('resolution=ignore-duplicates');
  });

  it('keeps a caller-provided id unchanged', async () => {
    await offlineMutation({
      table: 'transactions',
      method: 'POST',
      body: { id: 'fixed-id-1', user_id: 'u1', amount: 100 },
    });
    expect(enqueueRequest.mock.calls[0][0].payload.id).toBe('fixed-id-1');
  });
});
