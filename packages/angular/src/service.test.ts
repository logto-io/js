import type LogtoClient from '@logto/browser';
import type { AccessTokenClaims, IdTokenClaims, UserInfoResponse } from '@logto/browser';

import { LogtoService } from './service.js';

const createClient = () => {
  const accessTokenClaims: AccessTokenClaims = { sub: 'access-sub' };
  const organizationTokenClaims: AccessTokenClaims = { sub: 'organization-sub' };
  const idTokenClaims: IdTokenClaims = {
    iss: 'https://logto.example/oidc',
    sub: 'id-sub',
    aud: 'app-id',
    exp: 2_000_000_000,
    iat: 1_900_000_000,
  };
  const userInfo: UserInfoResponse = {
    iss: 'https://logto.example/oidc',
    sub: 'user-sub',
    aud: 'app-id',
    exp: 2_000_000_000,
    iat: 1_900_000_000,
  };
  const methods = {
    isAuthenticated: vi.fn(async () => false),
    isSignInRedirected: vi.fn(async () => false),
    handleSignInCallback: vi.fn(async () => {
      await Promise.resolve();
    }),
    getRefreshToken: vi.fn(async () => 'refresh-token'),
    getAccessToken: vi.fn(async () => 'access-token'),
    getAccessTokenClaims: vi.fn(async () => accessTokenClaims),
    getOrganizationToken: vi.fn(async () => 'organization-token'),
    getOrganizationTokenClaims: vi.fn(async () => organizationTokenClaims),
    getIdToken: vi.fn(async () => 'id-token'),
    getIdTokenClaims: vi.fn(async () => idTokenClaims),
    signIn: vi.fn(async () => {
      await Promise.resolve();
    }),
    signOut: vi.fn(async () => {
      await Promise.resolve();
    }),
    fetchUserInfo: vi.fn(async () => userInfo),
    clearAccessToken: vi.fn(async () => {
      await Promise.resolve();
    }),
    clearAllTokens: vi.fn(async () => {
      await Promise.resolve();
    }),
  };

  return {
    client: methods as unknown as LogtoClient,
    methods,
  };
};

describe('LogtoService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('restores authentication once and settles the initial loading state', async () => {
    const { client, methods } = createClient();
    methods.isAuthenticated.mockResolvedValue(true);
    const service = new LogtoService(client);

    expect(service.isLoading()).toBe(true);
    expect(service.isAuthenticated()).toBe(false);

    await Promise.all([service.initialize(), service.initialize()]);

    expect(methods.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeUndefined();
  });

  it('exposes initialization errors without rejecting', async () => {
    const { client, methods } = createClient();
    const error = new Error('Storage unavailable');
    methods.isAuthenticated.mockRejectedValue(error);
    const service = new LogtoService(client);

    await expect(service.initialize()).resolves.toBeUndefined();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBe(error);
  });

  it('retries initialization after a failure and caches the successful result', async () => {
    const { client, methods } = createClient();
    const error = new Error('Storage unavailable');
    methods.isAuthenticated.mockRejectedValueOnce(error).mockResolvedValueOnce(true);
    const service = new LogtoService(client);

    await Promise.all([service.initialize(), service.initialize()]);

    expect(methods.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(service.error()).toBe(error);
    expect(service.isLoading()).toBe(false);

    const retry = service.initialize();

    expect(service.isLoading()).toBe(true);
    await retry;
    await service.initialize();

    expect(methods.isAuthenticated).toHaveBeenCalledTimes(2);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.error()).toBeUndefined();
    expect(service.isLoading()).toBe(false);
  });

  it('keeps loading until all concurrent operations settle', async () => {
    vi.useFakeTimers();
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();
    methods.getAccessToken
      .mockImplementationOnce(
        async () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve('first-token');
            }, 10);
          })
      )
      .mockImplementationOnce(
        async () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve('second-token');
            }, 20);
          })
      );

    const firstToken = service.getAccessToken('first-resource');
    const secondToken = service.getAccessToken('second-resource');

    expect(service.isLoading()).toBe(true);
    await vi.advanceTimersByTimeAsync(10);
    await expect(firstToken).resolves.toBe('first-token');
    expect(service.isLoading()).toBe(true);
    await vi.advanceTimersByTimeAsync(10);
    await expect(secondToken).resolves.toBe('second-token');
    expect(service.isLoading()).toBe(false);
  });

  it('returns delegated token, claims, and userinfo values with unchanged arguments', async () => {
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();

    await expect(service.getRefreshToken()).resolves.toBe('refresh-token');
    await expect(service.getAccessToken('api-resource')).resolves.toBe('access-token');
    await expect(service.getAccessTokenClaims('api-resource')).resolves.toEqual({
      sub: 'access-sub',
    });
    await expect(service.getOrganizationToken('organization-id')).resolves.toBe(
      'organization-token'
    );
    await expect(service.getOrganizationTokenClaims('organization-id')).resolves.toEqual({
      sub: 'organization-sub',
    });
    await expect(service.getIdToken()).resolves.toBe('id-token');
    await expect(service.getIdTokenClaims()).resolves.toMatchObject({ sub: 'id-sub' });
    await expect(service.fetchUserInfo()).resolves.toMatchObject({ sub: 'user-sub' });

    expect(methods.getAccessToken).toHaveBeenCalledWith('api-resource');
    expect(methods.getAccessTokenClaims).toHaveBeenCalledWith('api-resource');
    expect(methods.getOrganizationToken).toHaveBeenCalledWith('organization-id');
    expect(methods.getOrganizationTokenClaims).toHaveBeenCalledWith('organization-id');
  });

  it('sets the error signal and rethrows the original operation error', async () => {
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();
    const error = new Error('Not authenticated');
    methods.getAccessToken.mockRejectedValue(error);

    await expect(service.getAccessToken()).rejects.toBe(error);

    expect(service.error()).toBe(error);
    expect(service.isLoading()).toBe(false);
    service.clearError();
    expect(service.error()).toBeUndefined();
  });

  it('sets authentication after a successful callback and leaves it unchanged on failure', async () => {
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();

    await service.handleSignInCallback('https://app.example/callback?code=foo');

    expect(methods.handleSignInCallback).toHaveBeenCalledWith(
      'https://app.example/callback?code=foo'
    );
    expect(service.isAuthenticated()).toBe(true);

    const error = new Error('Invalid state');
    methods.handleSignInCallback.mockRejectedValueOnce(error);
    await expect(
      service.handleSignInCallback('https://app.example/callback?code=bar')
    ).rejects.toBe(error);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('checks whether the current URL is a sign-in redirect without changing operation state', async () => {
    const { client, methods } = createClient();
    methods.isSignInRedirected.mockResolvedValue(true);
    const service = new LogtoService(client);
    await service.initialize();
    const error = new Error('Not authenticated');
    methods.getAccessToken.mockRejectedValueOnce(error);
    await expect(service.getAccessToken()).rejects.toBe(error);

    await expect(service.isSignInRedirected('https://app.example/callback?code=foo')).resolves.toBe(
      true
    );

    expect(methods.isSignInRedirected).toHaveBeenCalledWith(
      'https://app.example/callback?code=foo'
    );
    expect(service.error()).toBe(error);
    expect(service.isLoading()).toBe(false);
  });

  it('updates authentication only after all tokens are cleared successfully', async () => {
    const { client, methods } = createClient();
    methods.isAuthenticated.mockResolvedValue(true);
    const service = new LogtoService(client);
    await service.initialize();

    await service.clearAccessToken();
    expect(service.isAuthenticated()).toBe(true);

    const error = new Error('Storage write failed');
    methods.clearAllTokens.mockRejectedValueOnce(error);
    await expect(service.clearAllTokens()).rejects.toBe(error);
    expect(service.isAuthenticated()).toBe(true);

    await service.clearAllTokens();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('preserves sign-in overload arguments and loading during successful navigation', async () => {
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();

    await service.signIn({
      redirectUri: 'https://app.example/callback',
      postRedirectUri: 'https://app.example/',
    });

    expect(methods.signIn).toHaveBeenCalledWith({
      redirectUri: 'https://app.example/callback',
      postRedirectUri: 'https://app.example/',
    });
    expect(service.isLoading()).toBe(true);
  });

  it('settles loading and exposes an error when sign-in navigation fails', async () => {
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();
    const error = new Error('Navigation blocked');
    methods.signIn.mockRejectedValue(error);

    await expect(
      service.signIn('https://app.example/callback', 'signIn', 'user@example.com')
    ).rejects.toBe(error);

    expect(methods.signIn).toHaveBeenCalledWith(
      'https://app.example/callback',
      'signIn',
      'user@example.com'
    );
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBe(error);
  });

  it('delegates sign-out and settles loading after starting navigation', async () => {
    const { client, methods } = createClient();
    const service = new LogtoService(client);
    await service.initialize();

    await service.signOut('https://app.example/');

    expect(methods.signOut).toHaveBeenCalledWith('https://app.example/');
    expect(service.isLoading()).toBe(false);
  });
});
