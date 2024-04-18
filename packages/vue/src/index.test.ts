import LogtoClient from '@logto/browser';
import { type App, readonly } from 'vue';

import { contextInjectionKey, logtoInjectionKey } from './consts.js';
import { createContext } from './context.js';
import { useLogto, useHandleSignInCallback, createLogto } from './index.js';
import { createPluginMethods } from './plugin.js';

const isAuthenticated = vi.fn(async () => false);
const isSignInRedirected = vi.fn(async () => false);
const handleSignInCallback = vi.fn().mockResolvedValue(true);
const mockedFetchUserInfo = vi.fn().mockResolvedValue({ sub: 'foo' });
const getAccessToken = vi.fn(() => {
  throw new Error('not authenticated');
});
const signIn = vi.fn();
const injectMock = vi.fn<string[], unknown>((): unknown => {
  return undefined;
});
vi.mock('vue', async (importOriginal) => {
  return {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    ...(await importOriginal<typeof import('vue')>()),
    inject: (key: string) => {
      return injectMock(key);
    },
  };
});

vi.mock('@logto/browser', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        isAuthenticated,
        isSignInRedirected,
        handleSignInCallback,
        getRefreshToken: vi.fn(),
        getAccessToken,
        getAccessTokenClaims: vi.fn(),
        getOrganizationToken: vi.fn(),
        getOrganizationTokenClaims: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenClaims: vi.fn(),
        signIn,
        signOut: vi.fn(),
        fetchUserInfo: mockedFetchUserInfo,
        clearAccessToken: vi.fn(),
        clearAllTokens: vi.fn(),
      } satisfies Partial<LogtoClient>;
    }),
  };
});

const appId = 'foo';
const endpoint = 'https://endpoint.com';

const appMock = {
  provide: vi.fn(),
} as unknown as App;

describe('createLogto.install', () => {
  it('should call LogtoClient constructor and provide Logto context data', async () => {
    createLogto.install(appMock, { appId, endpoint });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, appId });
    expect(appMock.provide).toBeCalled();
  });
});

describe('Logto plugin not installed', () => {
  it('should throw error if calling `useLogto` before install', () => {
    expect(() => {
      useLogto();
    }).toThrowError('Must install Logto plugin first.');
  });

  it('should throw error if calling `useHandleSignInCallback` before install', () => {
    expect(() => {
      useHandleSignInCallback();
    }).toThrowError('Must install Logto plugin first.');
  });
});

describe('useLogto', () => {
  beforeEach(() => {
    const client = new LogtoClient({ appId, endpoint });
    const context = createContext(client);
    const { isAuthenticated, isLoading, error } = context;

    injectMock.mockImplementationOnce(() => {
      return {
        isAuthenticated: readonly(isAuthenticated),
        isLoading: readonly(isLoading),
        error: readonly(error),
        ...createPluginMethods(context),
      };
    });
  });

  it('should inject Logto context data', () => {
    const {
      isAuthenticated,
      isLoading,
      error,
      signIn,
      signOut,
      getAccessToken,
      getAccessTokenClaims,
      getOrganizationToken,
      getOrganizationTokenClaims,
      getIdToken,
      getIdTokenClaims,
      fetchUserInfo,
      clearAccessToken,
      clearAllTokens,
    } = useLogto();

    expect(isAuthenticated.value).toBe(false);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeUndefined();
    expect(signIn).toBeInstanceOf(Function);
    expect(signOut).toBeInstanceOf(Function);
    expect(getAccessToken).toBeInstanceOf(Function);
    expect(getAccessTokenClaims).toBeInstanceOf(Function);
    expect(getOrganizationToken).toBeInstanceOf(Function);
    expect(getOrganizationTokenClaims).toBeInstanceOf(Function);
    expect(getIdToken).toBeInstanceOf(Function);
    expect(getIdTokenClaims).toBeInstanceOf(Function);
    expect(fetchUserInfo).toBeInstanceOf(Function);
    expect(clearAccessToken).toBeInstanceOf(Function);
    expect(clearAllTokens).toBeInstanceOf(Function);
  });

  it('should return error when getAccessToken fails', async () => {
    const client = new LogtoClient({ appId, endpoint });
    const context = createContext(client);
    const { getAccessToken } = createPluginMethods(context);
    const { error } = context;

    await getAccessToken();
    expect(error.value).not.toBeUndefined();
    expect(error.value?.message).toBe('not authenticated');
  });
});

describe('useHandleSignInCallback', () => {
  beforeEach(() => {
    const client = new LogtoClient({ appId, endpoint });
    const context = createContext(client);

    injectMock.mockImplementation((key: string) => {
      if (key === contextInjectionKey) {
        return context;
      }

      if (key === logtoInjectionKey) {
        const { isAuthenticated, isLoading, error } = context;

        return {
          isAuthenticated: readonly(isAuthenticated),
          isLoading: readonly(isLoading),
          error: readonly(error),
          ...createPluginMethods(context),
        };
      }
    });
  });

  it('should not call `handleSignInCallback` if current url is not callback url', async () => {
    const { signIn } = useLogto();
    useHandleSignInCallback();

    await signIn('https://example.com');
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  it('should call `handleSignInCallback` if current url is callback url', async () => {
    isSignInRedirected.mockResolvedValueOnce(true);
    const { signIn } = useLogto();
    useHandleSignInCallback();

    await signIn('https://example.com');

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(handleSignInCallback).toHaveBeenCalledTimes(1);
        handleSignInCallback.mockRestore();
        resolve();
      });
    });
  });

  it('should call `handleSignInCallback` only once even if it fails internally', async () => {
    expect(handleSignInCallback).toHaveBeenCalledTimes(0);
    isSignInRedirected.mockResolvedValueOnce(true);
    handleSignInCallback.mockRejectedValueOnce(new Error('Oops'));
    const { signIn } = useLogto();
    useHandleSignInCallback();

    await signIn('https://example.com');

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(handleSignInCallback).toHaveBeenCalledTimes(1);
        resolve();
      });
    });
  });

  it('should return userinfo after calling `fetchUserInfo`', async () => {
    const { fetchUserInfo } = useLogto();
    const userInfo = await fetchUserInfo();

    expect(userInfo).toEqual({ sub: 'foo' });
    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
  });
});
