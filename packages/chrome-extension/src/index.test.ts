import LogtoClient from './index.js';
import { ChromeExtensionCacheStorage } from './storage.js';

const config = {
  endpoint: 'https://example.logto.app',
  appId: 'app-id',
};

beforeEach(() => {
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn().mockResolvedValue({}),
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LogtoClient', () => {
  it('keeps cache disabled by default and supports opting in', () => {
    expect(new LogtoClient(config).adapter.cache).toBeUndefined();
    expect(new LogtoClient(config, { enableCache: true }).adapter.cache).toBeInstanceOf(
      ChromeExtensionCacheStorage
    );
  });
});
