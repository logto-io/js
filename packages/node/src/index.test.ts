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

const { decodeAccessToken } = vi.hoisted(() => ({
  decodeAccessToken: vi.fn(() => ({ scope: 'read' })),
}));
const getAccessToken = vi.fn(async () => 'access-token');
const getOrganizationToken = vi.fn(async () => 'token');
const fetchUserInfo = vi.fn(async () => ({ name: 'name' }));
const mockIdTokenClaims = { sub: 'sub', organizations: ['org1'] };
const getIdTokenClaims = vi.fn(async () => mockIdTokenClaims);
const isAuthenticated = vi.fn(async () => true);
vi.mock('@logto/client', () => ({
  __esModule: true,
  decodeAccessToken,
  default: vi.fn(() => ({
    getAccessToken,
    getOrganizationToken,
    getIdTokenClaims,
    isAuthenticated,
    fetchUserInfo,
  })),
}));

const getLatestBaseClientAdapter = (): ClientAdapter => {
  const { calls } = vi.mocked(BaseClient).mock;
  const [, adapter] = calls.at(-1)!;
  return adapter;
};

describe('LogtoClient', () => {
  describe('constructor', () => {
    beforeEach(() => {
      vi.mocked(BaseClient).mockClear();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('uses the client native fetch fallback by default', () => {
      expect(new LogtoClient({ endpoint, appId }, { navigate, storage })).toBeDefined();
      expect(getLatestBaseClientAdapter()).not.toHaveProperty('fetch');
      expect(getLatestBaseClientAdapter()).not.toHaveProperty('requester');
    });

    it('provides an authenticated fetch transport when an app secret is configured', async () => {
      const fetchTransport = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(null));
      expect(
        new LogtoClient({ endpoint, appId, appSecret: 'app_secret' }, { navigate, storage })
      ).toBeDefined();

      await getLatestBaseClientAdapter().fetch?.('https://logto.example.com');

      expect(fetchTransport).toHaveBeenCalledOnce();
      const request = new Request(fetchTransport.mock.calls[0]![0]);
      expect(request.headers.get('Authorization')).toBe(
        `Basic ${Buffer.from(`${appId}:app_secret`, 'utf8').toString('base64')}`
      );
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
      expect(request.headers.get('Authorization')).toBe(
        `Basic ${Buffer.from(`${appId}:app_secret`, 'utf8').toString('base64')}`
      );
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

    it('preserves a custom fetch when an app secret is configured', () => {
      const customFetch = vi.fn<typeof fetch>();
      expect(
        new LogtoClient(
          { endpoint, appId, appSecret: 'app_secret' },
          { navigate, storage, fetch: customFetch }
        )
      ).toBeDefined();

      expect(getLatestBaseClientAdapter().fetch).toBe(customFetch);
    });

    it('should provide endpoint-scoped cache storage by default', () => {
      expect(
        new LogtoClient({ endpoint: `${endpoint}/`, appId }, { navigate, storage })
      ).toBeDefined();
      const { cache } = getLatestBaseClientAdapter();

      expect(new LogtoClient({ endpoint, appId }, { navigate, storage })).toBeDefined();
      expect(getLatestBaseClientAdapter().cache).toBe(cache);

      expect(
        new LogtoClient({ endpoint: 'https://another.logto.dev', appId }, { navigate, storage })
      ).toBeDefined();
      expect(getLatestBaseClientAdapter().cache).not.toBe(cache);
    });

    it('should allow overriding the default cache storage through the deprecated property', () => {
      const unstableCache = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      };

      expect(
        new LogtoClient({ endpoint, appId }, { navigate, storage, unstable_cache: unstableCache })
      ).toBeDefined();
      expect(getLatestBaseClientAdapter().cache).toBe(unstableCache);
    });

    it('should allow overriding the default cache storage through the stable property', () => {
      const cache = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      };

      expect(new LogtoClient({ endpoint, appId }, { navigate, storage, cache })).toBeDefined();
      expect(getLatestBaseClientAdapter().cache).toBe(cache);
    });

    it('should prefer the stable cache property', () => {
      const cache = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() };
      const unstableCache = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() };

      expect(
        new LogtoClient(
          { endpoint, appId },
          { navigate, storage, cache, unstable_cache: unstableCache }
        )
      ).toBeDefined();
      expect(getLatestBaseClientAdapter().cache).toBe(cache);
    });

    it('should use the default cache when cache properties are explicitly undefined', () => {
      expect(
        new LogtoClient(
          { endpoint, appId },
          { navigate, storage, cache: undefined, unstable_cache: undefined }
        )
      ).toBeDefined();
      expect(getLatestBaseClientAdapter().cache).toBeDefined();
    });
  });

  describe('getContext', () => {
    beforeEach(() => {
      getAccessToken.mockClear();
      decodeAccessToken.mockClear();
      getOrganizationToken.mockClear();
      fetchUserInfo.mockClear();
    });

    it('should set isAuthenticated to false when "getAccessToken" is enabled and is unable to getAccessToken', async () => {
      getAccessToken.mockRejectedValueOnce(new Error('Unauthorized'));
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(
        client.getContext({ getAccessToken: true, resource: 'resource' })
      ).resolves.toEqual({
        isAuthenticated: false,
      });
      expect(getAccessToken).toHaveBeenCalledWith('resource', undefined);
    });

    it('should get access token with organization id', async () => {
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(
        client.getContext({
          getAccessToken: true,
          resource: 'resource',
          organizationId: 'org1',
        })
      ).resolves.toMatchObject({
        isAuthenticated: true,
      });
      expect(getAccessToken).toHaveBeenCalledWith('resource', 'org1');
      expect(getAccessToken).toHaveBeenCalledOnce();
      expect(decodeAccessToken).toHaveBeenCalledWith('access-token');
    });

    it('should get organization tokens', async () => {
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(client.getContext({ getOrganizationToken: true })).resolves.toEqual({
        isAuthenticated: true,
        claims: mockIdTokenClaims,
        organizationTokens: { org1: 'token' },
        userInfo: undefined,
      });
      expect(getOrganizationToken).toHaveBeenCalledWith('org1');
    });

    it('should fetch remote user info and return when "fetchUserInfo" is enabled', async () => {
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(
        client.getContext({
          fetchUserInfo: true,
        })
      ).resolves.toMatchObject({
        claims: { sub: 'sub' },
        userInfo: { name: 'name' },
      });
      expect(fetchUserInfo).toHaveBeenCalled();
    });

    it('should return context and not call getAccessToken, getOrganizationToken, fetchUserInfo by default', async () => {
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(client.getContext()).resolves.toEqual({
        isAuthenticated: true,
        claims: mockIdTokenClaims,
        organizationTokens: undefined,
        userInfo: undefined,
      });
      expect(getIdTokenClaims).toHaveBeenCalled();
      expect(getAccessToken).not.toHaveBeenCalled();
      expect(getOrganizationToken).not.toHaveBeenCalled();
      expect(fetchUserInfo).not.toHaveBeenCalled();
    });
  });
});
