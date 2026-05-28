import BaseClient, { type ClientAdapter } from '@logto/client';

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
  createRequester: vi.fn(),
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
