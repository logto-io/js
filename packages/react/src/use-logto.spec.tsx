import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

import { LogtoProvider } from './provider';
import useLogto from './use-logto';

const isAuthenticated = jest.fn();
const isLoginRedirect = jest.fn();
const handleCallback = jest.fn(async () => Promise.resolve());
const getClaims = jest.fn(() => ({
  iss: 'logto.dev',
  sub: 'foo',
  aud: 'client1',
  exp: 123,
  iat: 123,
  at_hash: 'at_hash',
}));

jest.mock('@logto/client', () => {
  const Mocked = jest.fn(() => {
    return {
      sessionManager: { get: jest.fn() },
      isAuthenticated,
      handleCallback,
      logout: jest.fn(),
      isLoginRedirect,
      getClaims,
    };
  });

  return {
    default: Mocked,
    create: jest.fn(() => new Mocked()),
  };
});

afterEach(() => {
  isAuthenticated.mockClear();
  isLoginRedirect.mockClear();
  handleCallback.mockClear();
});

const DOMAIN = 'logto.dev';
const CLIENT_ID = 'client1';

const createHookWrapper =
  () =>
  ({ children }: { children: React.ComponentType<unknown> }) =>
    (
      <LogtoProvider
        logtoConfig={{
          domain: DOMAIN,
          clientId: CLIENT_ID,
        }}
      >
        {children}
      </LogtoProvider>
    );

describe('useLogto', () => {
  test('without provider should throw', () => {
    const { result } = renderHook(() => useLogto());
    expect(result.error).not.toBeUndefined();
  });

  test('initiated and not authenticated', async () => {
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    const { isAuthenticated, isInitialized } = result.current;
    expect(isInitialized).toBeFalsy();
    await waitFor(() => {
      const { isInitialized } = result.current;
      expect(isInitialized).toBeTruthy();
    });
    expect(isAuthenticated).toBeFalsy();
    expect(result.current.error).toBeUndefined();
  });

  test('change from not authenticated to authenticated', async () => {
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    await waitFor(() => {
      const { isInitialized } = result.current;
      expect(isInitialized).toBeTruthy();
    });
    expect(result.current.isAuthenticated).toBeFalsy();
    await act(async () => result.current.handleCallback('url'));
    await waitFor(() => {
      const { isLoading } = result.current;
      expect(isLoading).toBeFalsy();
    });
    expect(result.current.isAuthenticated).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.claims).not.toBeUndefined();
  });

  test('change from authenticated to not authenticated', async () => {
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    await waitFor(() => {
      const { isInitialized } = result.current;
      expect(isInitialized).toBeTruthy();
    });
    expect(result.current.isAuthenticated).toBeFalsy();
    await act(async () => result.current.handleCallback('url'));
    await waitFor(() => {
      const { isLoading } = result.current;
      expect(isLoading).toBeFalsy();
    });
    expect(result.current.isAuthenticated).toBeTruthy();
    act(() => {
      result.current.logout('url');
    });
    expect(result.current.isAuthenticated).toBeFalsy();
    expect(result.current.error).toBeUndefined();
  });

  describe('auto handle callback', () => {
    test('not in callback url should not call `handleCallback`', async () => {
      isLoginRedirect.mockImplementation(() => false);
      const { result, waitFor } = renderHook(() => useLogto(), {
        wrapper: createHookWrapper(),
      });
      await waitFor(() => {
        const { isInitialized } = result.current;
        expect(isInitialized).toBeTruthy();
      });
      expect(handleCallback).not.toHaveBeenCalled();
      expect(result.current.error).toBeUndefined();
    });

    test('in callback url should call `handleCallback`, and isLoading should be true before complete', async () => {
      isLoginRedirect.mockImplementation(() => true);
      const { result, waitFor } = renderHook(() => useLogto(), {
        wrapper: createHookWrapper(),
      });
      await waitFor(() => {
        const { isInitialized, isLoading } = result.current;
        expect(isInitialized).toBeTruthy();
        expect(isLoading).toBeTruthy();
      });
      await waitFor(() => {
        const { isAuthenticated } = result.current;
        expect(isAuthenticated).toBeTruthy();
      });
      expect(result.current.error).toBeUndefined();
      expect(handleCallback).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.claims).not.toBeUndefined();
    });
  });
});
