import LogtoClient from '@logto/browser';
import { renderHook, act } from '@testing-library/react-hooks';
import { type ReactNode } from 'react';

import { LogtoContext, type LogtoContextProps } from '../context.js';
import { LogtoProvider } from '../provider.js';

import { useHandleSignInCallback, useLogto } from './index.js';

const isAuthenticated = jest.fn(() => false);
const isSignInRedirected = jest.fn(() => false);
const handleSignInCallback = jest.fn().mockResolvedValue(undefined);
const getAccessToken = jest.fn(() => {
  throw new Error('not authenticated');
});

const notImplemented = () => {
  throw new Error('Not imeplmented');
};

jest.mock('@logto/browser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAuthenticated,
      isSignInRedirected,
      handleSignInCallback,
      getAccessToken,
      signIn: jest.fn().mockResolvedValue(undefined),
      signOut: jest.fn().mockResolvedValue(undefined),
    };
  });
});

const endpoint = 'https://logto.dev';
const appId = 'foo';

const createHookWrapper =
  () =>
  ({ children }: { children?: ReactNode }) =>
    <LogtoProvider config={{ endpoint, appId }}>{children}</LogtoProvider>;

describe('useLogto', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('without provider should throw', () => {
    const { result } = renderHook(useLogto);
    expect(result.error).not.toBeUndefined();
  });

  test('useLogto should call LogtoClient constructor', async () => {
    await act(async () => {
      renderHook(useLogto, {
        wrapper: createHookWrapper(),
      });
    });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, appId });
  });

  test('useLogto should return LogtoClient property methods', async () => {
    await act(async () => {
      const { result, waitFor } = renderHook(useLogto, {
        wrapper: createHookWrapper(),
      });

      await waitFor(() => {
        const { signIn, signOut, fetchUserInfo, getAccessToken, getIdTokenClaims } = result.current;

        expect(result.error).toBeUndefined();
        expect(signIn).not.toBeUndefined();
        expect(signOut).not.toBeUndefined();
        expect(fetchUserInfo).not.toBeUndefined();
        expect(getAccessToken).not.toBeUndefined();
        expect(getIdTokenClaims).not.toBeUndefined();
      });
    });
  });

  test('it should not call `handleSignInCallback` when it is not in callback url', async () => {
    await act(async () => {
      renderHook(useHandleSignInCallback, {
        wrapper: createHookWrapper(),
      });
    });
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  test('should not call `handleSignInCallback` when it is authenticated', async () => {
    isAuthenticated.mockReturnValueOnce(true);
    isSignInRedirected.mockImplementation(() => true);

    await act(async () => {
      renderHook(useHandleSignInCallback, {
        wrapper: createHookWrapper(),
      });
    });
    expect(handleSignInCallback).not.toHaveBeenCalled();
    isSignInRedirected.mockRestore();
  });

  test('should not call `handleSignInCallback` when it is loading', async () => {
    // TODO: @Charles update other hook tests to use mock client and context
    const mockClient = new LogtoClient({ endpoint, appId });
    const mockContext: LogtoContextProps = {
      logtoClient: mockClient,
      isAuthenticated: false,
      loadingCount: 1,
      setIsAuthenticated: notImplemented,
      setLoadingCount: notImplemented,
      setError: notImplemented,
    };

    jest.spyOn(mockClient, 'isSignInRedirected').mockResolvedValue(true);

    await act(async () => {
      renderHook(useHandleSignInCallback, {
        wrapper: ({ children }: { children?: ReactNode }) => (
          <LogtoContext.Provider value={mockContext}>{children}</LogtoContext.Provider>
        ),
      });
    });
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  test('in callback url should call `handleSignInCallback`', async () => {
    isSignInRedirected.mockImplementation(() => true);

    await act(async () => {
      const { waitFor, result } = renderHook(useHandleSignInCallback, {
        wrapper: createHookWrapper(),
      });
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
    expect(handleSignInCallback).toHaveBeenCalledTimes(1);
    isSignInRedirected.mockRestore();
  });

  test('useLogto hook should return error when getAccessToken fails', async () => {
    await act(async () => {
      const { result, waitFor } = renderHook(useLogto, {
        wrapper: createHookWrapper(),
      });

      await act(async () => {
        await result.current.getAccessToken();
      });
      await waitFor(() => {
        expect(result.current.error).not.toBeUndefined();
        expect(result.current.error?.message).toBe('not authenticated');
      });
    });
  });
});
