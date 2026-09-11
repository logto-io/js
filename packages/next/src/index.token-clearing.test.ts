import { testApiHandler } from 'next-test-api-route-handler';

import LogtoClient from './index.js';
import type { LogtoNextConfig } from './types.js';

const clearAccessToken = vi.fn();
const clearAllTokens = vi.fn();

vi.mock('@logto/node', async (importOriginal) => ({
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  ...(await importOriginal<typeof import('@logto/node')>()),
  __esModule: true,
  default: vi.fn(() => ({ clearAccessToken, clearAllTokens })),
}));

const config: LogtoNextConfig = {
  appId: 'app-id',
  endpoint: 'https://logto.example.com',
  baseUrl: 'https://app.example.com',
  cookieSecret: 'complex_password_at_least_32_characters_long',
  cookieSecure: false,
};

describe('Next: token clearing', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['clearAccessToken', clearAccessToken],
    ['clearAllTokens', clearAllTokens],
  ] as const)(
    'calls NodeClient.%s through request-scoped storage',
    async (method, clientMethod) => {
      const client = new LogtoClient(config);

      await testApiHandler({
        pagesHandler: async (request, response) => {
          await client[method](request, response);
          response.end();
        },
        test: async ({ fetch }) => {
          await fetch({ method: 'POST' });
        },
      });

      expect(clientMethod).toHaveBeenCalledOnce();
    }
  );
});
