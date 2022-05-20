import LogtoClient from '@logto/browser';
import { App, readonly } from 'vue';

import { useLogto, useHandleSignInCallback, createLogto } from '.';
import { contextInjectionKey, logtoInjectionKey } from './consts';
import { createContext } from './context';
import { createPluginMethods } from './plugin';

const isSignInRedirected = jest.fn(() => false);
const handleSignInCallback = jest.fn(async () => Promise.resolve());
const getAccessToken = jest.fn(() => {
  throw new Error('not authenticated');
});
const injectMock = jest.fn<any, string[]>((): any => {
  return undefined;
});

jest.mock('@logto/browser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAuthenticated: false,
      isSignInRedirected,
      handleSignInCallback,
      getAccessToken,
      signIn: jest.fn(async () => Promise.resolve()),
      signOut: jest.fn(async () => Promise.resolve()),
    };
  });
});

jest.mock('vue', () => {
  return {
    ...jest.requireActual('vue'),
    inject: (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return injectMock(key);
    },
  };
});

const appId = 'foo';
const endpoint = 'https://endpoint.com';

const appMock = {
  provide: jest.fn(),
} as any as App;

describe('createLogto.install', () => {
  test('should call LogtoClient constructor and provide Logto context data', async () => {
    createLogto.install(appMock, { appId, endpoint });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, appId });
    expect(appMock.provide).toBeCalled();
  });
});

describe('Logto plugin not installed', () => {
  test('should throw error if calling `useLogto` before install', () => {
    expect(() => {
      useLogto();
    }).toThrowError('Must install Logto plugin first.');
  });

  test('should throw error if calling `useHandleSignInCallback` before install', () => {
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

  test('should inject Logto context data', () => {
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
    expect(error?.value).toBeUndefined();
    expect(signIn).toBeInstanceOf(Function);
    expect(signOut).toBeInstanceOf(Function);
    expect(getAccessToken).toBeInstanceOf(Function);
    expect(getIdTokenClaims).toBeInstanceOf(Function);
    expect(fetchUserInfo).toBeInstanceOf(Function);
  });

  test('should return error when getAccessToken fails', async () => {
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

  test('not in callback url should not call `handleSignInCallback`', async () => {
    const { signIn } = useLogto();
    useHandleSignInCallback();

    await signIn('https://example.com');
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  test('in callback url should call `handleSignInCallback`', async () => {
    isSignInRedirected.mockImplementationOnce(() => true);
    const { signIn } = useLogto();
    useHandleSignInCallback();

    await signIn('https://example.com');

    expect(handleSignInCallback).toHaveBeenCalledTimes(1);
  });
});
