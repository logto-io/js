import LogtoClient from '.';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

const navigate = jest.fn();
const storage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
};

const getAccessToken = jest.fn(async () => true);
const getIdTokenClaims = jest.fn(async () => ({ sub: 'sub' }));
const isAuthenticated = jest.fn(async () => true);
jest.mock('@logto/client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getAccessToken,
    getIdTokenClaims,
    isAuthenticated,
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
    });

    it('should set isAuthenticated to false when "getAccessToken" is enabled and is unable to getAccessToken', async () => {
      getAccessToken.mockRejectedValueOnce(new Error('Unauthorized'));
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(client.getContext(true)).resolves.toEqual({ isAuthenticated: false });
      expect(getAccessToken).toHaveBeenCalled();
    });

    it('should return context and not call getAccessToken by default', async () => {
      const client = new LogtoClient({ endpoint, appId }, { navigate, storage });
      await expect(client.getContext()).resolves.toEqual({
        isAuthenticated: true,
        claims: { sub: 'sub' },
      });
      expect(getIdTokenClaims).toHaveBeenCalled();
      expect(getAccessToken).not.toHaveBeenCalled();
    });
  });
});
