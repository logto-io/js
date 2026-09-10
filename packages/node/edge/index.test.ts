import BaseClient, { type ClientAdapter } from '@logto/client';
import { encode } from 'js-base64';

import LogtoClient from './index.js';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

const navigate = vi.fn();
const storage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.mock('@logto/client', () => ({
  __esModule: true,
  default: vi.fn(),
}));

const getLatestBaseClientAdapter = (): ClientAdapter => {
  const { calls } = vi.mocked(BaseClient).mock;
  const [, adapter] = calls.at(-1)!;
  return adapter;
};

describe('LogtoClient (edge)', () => {
  beforeEach(() => {
    vi.mocked(BaseClient).mockClear();
  });

  it('uses the client native fetch fallback by default', () => {
    expect(new LogtoClient({ endpoint, appId }, { navigate, storage })).toBeDefined();
    expect(getLatestBaseClientAdapter()).not.toHaveProperty('fetch');
    expect(getLatestBaseClientAdapter()).not.toHaveProperty('requester');
  });

  it('preserves a custom requester when an app secret is configured', () => {
    const requester = vi.fn() as unknown as NonNullable<ClientAdapter['requester']>;
    expect(
      new LogtoClient(
        { endpoint, appId, appSecret: 'app_secret' },
        { navigate, storage, requester }
      )
    ).toBeDefined();

    expect(getLatestBaseClientAdapter().requester).toBe(requester);
    expect(getLatestBaseClientAdapter()).not.toHaveProperty('fetch');
  });

  it('does not let an undefined fetch override the authenticated transport', async () => {
    const fetchTransport = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(null));
    expect(
      new LogtoClient(
        { endpoint, appId, appSecret: 'app_secret' },
        { navigate, storage, fetch: undefined }
      )
    ).toBeDefined();

    await getLatestBaseClientAdapter().fetch?.('https://logto.example.com');

    expect(fetchTransport).toHaveBeenCalledOnce();
    const request = new Request(fetchTransport.mock.calls[0]![0]);
    expect(request.headers.get('Authorization')).toBe(`Basic ${encode(`${appId}:app_secret`)}`);
  });

  it('should provide endpoint-scoped cache storage by default', () => {
    expect(
      new LogtoClient({ endpoint: `${endpoint}/`, appId }, { navigate, storage })
    ).toBeDefined();
    const cache = getLatestBaseClientAdapter().unstable_cache;

    expect(new LogtoClient({ endpoint, appId }, { navigate, storage })).toBeDefined();
    expect(getLatestBaseClientAdapter().unstable_cache).toBe(cache);

    expect(
      new LogtoClient({ endpoint: 'https://another.logto.dev', appId }, { navigate, storage })
    ).toBeDefined();
    expect(getLatestBaseClientAdapter().unstable_cache).not.toBe(cache);
  });
});
