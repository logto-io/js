import LogtoClient from './index.js';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

const navigate = jest.fn();
const storage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
};

const getAccessToken = jest.fn(async () => true);
const getOrganizationToken = jest.fn(async () => 'token');
const fetchUserInfo = jest.fn(async () => ({ name: 'name' }));
const mockIdTokenClaims = { sub: 'sub', organizations: ['org1'] };
const getIdTokenClaims = jest.fn(async () => mockIdTokenClaims);
const isAuthenticated = jest.fn(async () => true);
jest.mock('@logto/client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getAccessToken,
    getOrganizationToken,
    getIdTokenClaims,
    isAuthenticated,
    fetchUserInfo,
  })),
  createRequester: jest.fn(),
}));

describe('LogtoClient', () => {
  describe('constructor', () => {
    it('constructor should not throw', () => {
      expect(() => new LogtoClient({ endpoint, appId }, { navigate, storage })).not.toThrow();
    });
  });

  describe('getContext', () => {
    beforeEach(() => {
      getAccessToken.mockClear();
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
      expect(getAccessToken).toHaveBeenCalledWith('resource');
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
