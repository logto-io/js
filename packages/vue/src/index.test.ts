/* eslint-disable unicorn/no-useless-undefined */
import LogtoClient from '@logto/browser';
import { type App, ref, readonly, computed } from 'vue';

import { contextInjectionKey, logtoInjectionKey } from './consts.js';
import { createContext } from './context.js';
import { useLogto, useHandleSignInCallback, createLogto } from './index.js';
import { createPluginMethods } from './plugin.js';

const isAuthenticated = jest.fn(async () => false);
const isSignInRedirected = jest.fn(() => false);
const handleSignInCallback = jest.fn().mockResolvedValue(undefined);
const mockedFetchUserInfo = jest.fn().mockResolvedValue({ sub: 'foo' });
const getAccessToken = jest.fn(() => {
  throw new Error('not authenticated');
});
const injectMock = jest.fn<unknown, string[]>((): unknown => {
  return undefined;
});

jest.mock('@logto/browser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAuthenticated,
      isSignInRedirected,
      handleSignInCallback,
      getAccessToken,
      fetchUserInfo: mockedFetchUserInfo,
      signIn: jest.fn().mockResolvedValue(undefined),
      signOut: jest.fn().mockResolvedValue(undefined),
    };
  });
});

jest.mock('vue', () => {
  return {
    ...jest.requireActual('vue'),
    inject: (key: string) => {
      return injectMock(key);
    },
  };
});

const appId = 'foo';
const endpoint = 'https://endpoint.com';

const appMock = {
  provide: jest.fn(),
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
      getIdTokenClaims,
      fetchUserInfo,
    } = useLogto();

    expect(isAuthenticated.value).toBe(false);
    expect(isLoading.value).toBe(false);
    expect(error.value).toBeUndefined();
    expect(signIn).toBeInstanceOf(Function);
    expect(signOut).toBeInstanceOf(Function);
    expect(getAccessToken).toBeInstanceOf(Function);
    expect(getIdTokenClaims).toBeInstanceOf(Function);
    expect(fetchUserInfo).toBeInstanceOf(Function);
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

  it('should not call `handleSignInCallback` when it is loading', async () => {
    const client = new LogtoClient({ appId, endpoint });
    const context = createContext(client);
    const { loadingCount, isLoading: _isLoading, ...restContext } = context;
    const { isAuthenticated, error } = restContext;
    const mockLoadingCount = ref(100);
    const mockIsLoading = computed(() => mockLoadingCount.value > 0);
    const mockContext = {
      ...restContext,
      isLoading: mockIsLoading,
      loadingCount: mockLoadingCount,
    };

    injectMock.mockImplementation((key: string) => {
      if (key === contextInjectionKey) {
        return mockContext;
      }

      if (key === logtoInjectionKey) {
        return {
          isAuthenticated: readonly(isAuthenticated),
          isLoading: readonly(mockIsLoading),
          error: readonly(error),
          ...createPluginMethods(mockContext),
        };
      }
    });
    isSignInRedirected.mockImplementationOnce(() => true);

    const { isLoading } = useLogto();
    expect(isLoading.value).toBe(true);

    useHandleSignInCallback();

    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  it('should call `handleSignInCallback` if current url is callback url', async () => {
    isSignInRedirected.mockImplementationOnce(() => true);
    const { signIn } = useLogto();
    useHandleSignInCallback();

    await signIn('https://example.com');

    expect(handleSignInCallback).toHaveBeenCalledTimes(1);
  });

  it('should return userinfo after calling `fetchUserInfo`', async () => {
    const { fetchUserInfo } = useLogto();
    const userInfo = await fetchUserInfo();

    expect(userInfo).toEqual({ sub: 'foo' });
    expect(mockedFetchUserInfo).toHaveBeenCalledTimes(1);
  });
});
/* eslint-enable unicorn/no-useless-undefined */
