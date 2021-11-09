import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

import { LogtoProvider } from './provider';
import useLogto from './use-logto';

const isAuthenticated = jest.fn();

jest.mock('@logto/client', () => {
  const Mocked = jest.fn(() => {
    return {
      isAuthenticated,
      handleCallback: jest.fn(),
      logout: jest.fn(),
    };
  });
  return {
    default: Mocked,
    create: jest.fn(() => new Mocked()),
  };
});

afterEach(() => {
  isAuthenticated.mockClear();
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

  test('inited and not authenticated', async () => {
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
  });
});
