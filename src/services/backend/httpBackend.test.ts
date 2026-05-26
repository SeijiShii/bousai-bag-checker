import { describe, it, expect, vi, afterEach } from 'vitest';
import { makeHttpBackend } from './httpBackend';

function mockFetch(impl: (url: string, init?: RequestInit) => { status?: number; body?: unknown }) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const { status = 200, body } = impl(url, init);
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (body === undefined ? '' : JSON.stringify(body)),
    } as Response;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('makeHttpBackend (/api/* 呼び出し)', () => {
  it('listItems は GET /api/items', async () => {
    const fetchMock = mockFetch(() => ({ body: [{ id: '1', name: '水', freshness: 'fresh' }] }));
    vi.stubGlobal('fetch', fetchMock);
    const backend = makeHttpBackend();
    const items = await backend.listItems();
    expect(items).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/items', expect.objectContaining({}));
  });

  it('createItem は POST /api/items (body 同梱)', async () => {
    const fetchMock = mockFetch(() => ({ status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    await makeHttpBackend().createItem({ name: '水', category: 'water', quantity: 1, freshnessType: 'expiry', expiresAt: '2027-01-01' });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/items');
    expect(init!.method).toBe('POST');
    expect(JSON.parse(init!.body as string).name).toBe('水');
  });

  it('removeItem は DELETE /api/items?id=', async () => {
    const fetchMock = mockFetch(() => ({}));
    vi.stubGlobal('fetch', fetchMock);
    await makeHttpBackend().removeItem('abc');
    expect(fetchMock).toHaveBeenCalledWith('/api/items?id=abc', expect.objectContaining({ method: 'DELETE' }));
  });

  it('exportShoppingCsv は /shopping を取得して CSV 化', async () => {
    const fetchMock = mockFetch(() => ({ body: [{ id: 's1', name: '電池', reason: 'expired', isBought: false }] }));
    vi.stubGlobal('fetch', fetchMock);
    const csv = await makeHttpBackend().exportShoppingCsv();
    expect(csv).toContain('品目,理由,購入済');
    expect(csv).toContain('電池');
  });

  it('createTipCheckout は POST /api/tip で { url } を返す', async () => {
    const fetchMock = mockFetch(() => ({ body: { url: 'https://stripe.test/cs' } }));
    vi.stubGlobal('fetch', fetchMock);
    const { url } = await makeHttpBackend().createTipCheckout();
    expect(url).toBe('https://stripe.test/cs');
  });

  it('非 2xx は ApiError を投げる', async () => {
    const fetchMock = mockFetch(() => ({ status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(makeHttpBackend().listItems()).rejects.toThrow(/404/);
  });
});
