import LogtoClient from '@logto/browser';
import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { LogtoProvider } from '../provider.js';

import { useHandleSignInCallback, useLogto } from './index.js';

const isAuthenticated = jest.fn(async () => false);
const isSignInRedirected = jest.fn(async () => false);
const handleSignInCallback = jest.fn().mockResolvedValue(undefined);
const getAccessToken = jest.fn(() => {
  throw new Error('not authenticated');
});

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
      signIn: jest.fn(),
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

describe('useLogto', () => {
  afterEach(() => {
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

  it('should return error when getAccessToken fails', async () => {
    const { result } = renderHook(useLogto, {
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
