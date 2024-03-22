import LogtoClient from '@logto/browser';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContext, type ReactNode, useEffect } from 'react';

import { LogtoContext } from '../context.js';
import { LogtoProvider } from '../provider.js';

import { useHandleSignInCallback, useLogto } from './index.js';

const isAuthenticated = jest.fn(async () => false);
const isSignInRedirected = jest.fn(async () => false);
const handleSignInCallback = jest.fn().mockResolvedValue(undefined);
const getAccessToken = jest.fn();
const signIn = jest.fn();

jest.mock('@logto/browser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isAuthenticated,
      isSignInRedirected,
      handleSignInCallback,
      getRefreshToken: jest.fn(),
      getAccessToken,
      getAccessTokenClaims: jest.fn(),
      getOrganizationToken: jest.fn(),
      getOrganizationTokenClaims: jest.fn(),
      getIdToken: jest.fn(),
      getIdTokenClaims: jest.fn(),
      signIn,
      signOut: jest.fn(),
      fetchUserInfo: jest.fn(),
    } satisfies Partial<LogtoClient>;
  });
});

const endpoint = 'https://logto.dev';
const appId = 'foo';

const createHookWrapper =
  () =>
  ({ children }: { children?: ReactNode }) => (
    <LogtoProvider config={{ endpoint, appId }}>{children}</LogtoProvider>
  );

const HasError = ({ children }: { children?: ReactNode }) => {
  const { error, setError } = useContext(LogtoContext);
  useEffect(() => {
    setError(new Error('Oops'));
  }, [setError]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{error ? children : null}</>;
};

const AlwaysLoading = ({ children }: { children?: ReactNode }) => {
  const { isLoading, setIsLoading } = useContext(LogtoContext);
  useEffect(() => {
    setIsLoading(true); // Simulate always loading
  }, [setIsLoading]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

describe('useLogto', () => {
  afterEach(() => {
    jest.clearAllMocks();
    handleSignInCallback.mockRestore();
  });

  it('should throw without using context provider', () => {
    expect(() => renderHook(useLogto)).toThrow();
  });

  it('should call LogtoClient constructor on init', async () => {
    await act(async () => {
      renderHook(useLogto, {
        wrapper: createHookWrapper(),
      });
    });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, appId }, false);
  });

  it('should return LogtoClient property methods', async () => {
    const { result } = renderHook(useLogto, {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      const { signIn, signOut, fetchUserInfo, getAccessToken, getIdTokenClaims, error } =
        result.current;

      expect(error).toBeUndefined();
      expect(signIn).toBeDefined();
      expect(signOut).toBeDefined();
      expect(fetchUserInfo).toBeDefined();
      expect(getAccessToken).toBeDefined();
      expect(getIdTokenClaims).toBeDefined();
    });
  });

  it('should not call `handleSignInCallback` when logtoClient is not found in the context', async () => {
    // Mock `isSignInRedirected` to return true for triggering `useEffect`
    isSignInRedirected.mockResolvedValueOnce(true);
    const { result } = renderHook(useHandleSignInCallback);

    await waitFor(() => {
      // LogtoClient is initialized
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(handleSignInCallback).not.toHaveBeenCalled();
    isSignInRedirected.mockRestore();
  });

  it('should not call `handleSignInCallback` when it is not in callback url', async () => {
    const { result } = renderHook(useHandleSignInCallback, {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      // LogtoClient is initialized
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  it('should not call `handleSignInCallback` when it is authenticated', async () => {
    isSignInRedirected.mockResolvedValueOnce(true);
    isAuthenticated.mockResolvedValueOnce(true);

    await act(async () => {
      renderHook(useHandleSignInCallback, {
        wrapper: createHookWrapper(),
      });
    });

    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  it('should call `handleSignInCallback` when navigated back to predefined callback url', async () => {
    isSignInRedirected.mockResolvedValueOnce(true);

    const { result } = renderHook(useHandleSignInCallback, {
      wrapper: createHookWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(handleSignInCallback).toHaveBeenCalledTimes(1);
  });

  it('should call `handleSignInCallback` only once even if it fails internally', async () => {
    isSignInRedirected.mockResolvedValueOnce(true);
    handleSignInCallback.mockRejectedValueOnce(new Error('Oops'));

    const { result } = renderHook(useHandleSignInCallback, {
      wrapper: createHookWrapper(),
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(handleSignInCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call `handleSignInCallback` when it is loading', async () => {
    isSignInRedirected.mockResolvedValueOnce(true);

    const { result } = renderHook(useHandleSignInCallback, {
      wrapper: ({ children }) => (
        <LogtoProvider config={{ endpoint, appId }}>
          <AlwaysLoading>{children}</AlwaysLoading>
        </LogtoProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Give some time for side effects to be triggered
    await new Promise((resolve) => {
      setTimeout(resolve, 1);
    });
    expect(handleSignInCallback).toHaveBeenCalledTimes(0);
  });

  it('should not call `handleSignInCallback` when `useLogto` has error', async () => {
    const { result } = renderHook(useHandleSignInCallback, {
      wrapper: ({ children }) => (
        <LogtoProvider config={{ endpoint, appId }}>
          <HasError>{children}</HasError>
        </LogtoProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    // Give some time for side effects to be triggered
    await new Promise((resolve) => {
      setTimeout(resolve, 1);
    });
    expect(handleSignInCallback).toHaveBeenCalledTimes(0);
  });

  it('should return error when getAccessToken fails', async () => {
    const { result } = renderHook(useLogto, {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      getAccessToken.mockRejectedValueOnce(new Error('not authenticated'));
      await result.current.getAccessToken();
    });
    await waitFor(() => {
      expect(result.current.error).not.toBeUndefined();
      expect(result.current.error?.message).toBe('not authenticated');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should use fallback error message when getAccessToken fails', async () => {
    const { result } = renderHook(useLogto, {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      getAccessToken.mockRejectedValueOnce('not authenticated');
      await result.current.getAccessToken('foo');
    });
    await waitFor(() => {
      expect(result.current.error).not.toBeUndefined();
      expect(result.current.error?.message).toBe(
        'Unexpected error occurred while calling bound mockConstructor.'
      );
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call the inner LogtoClient method when the hook method is called', async () => {
    const { result } = renderHook(useLogto, {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      await result.current.signIn('foo');
    });

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('foo');
      expect(result.current.error).toBeUndefined();
      // `signIn` disables resetting loading state
      expect(result.current.isLoading).toBe(true);
    });
  });

  it('should be able to call the inner LogtoClient method overload signature', async () => {
    const { result } = renderHook(useLogto, {
      wrapper: createHookWrapper(),
    });

    await act(async () => {
      await result.current.signIn({ redirectUri: 'foo' });
    });

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith({ redirectUri: 'foo' });
      expect(result.current.error).toBeUndefined();
      // `signIn` disables resetting loading state
      expect(result.current.isLoading).toBe(true);
    });
  });
});
