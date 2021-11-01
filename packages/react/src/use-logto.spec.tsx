import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

import { LogtoProvider } from './provider';
import useLogto from './use-logto';

const isAuthenticated = jest.fn();

jest.mock('@logto/client', () => {
  const Mocked = jest
    .fn()
    .mockImplementation(({ onAuthStateChange }: { onAuthStateChange: () => void }) => {
      return {
        isAuthenticated,
        handleCallback: jest.fn().mockImplementation(() => {
          onAuthStateChange();
        }),
        logout: jest.fn().mockImplementation(() => {
          onAuthStateChange();
        }),
      };
    });
  return {
    default: Mocked,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    create: jest.fn().mockImplementation((...args) => new Mocked(...args)),
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
    const { isAuthenticated, isLoading } = result.current;
    expect(isLoading).toBeTruthy();
    await waitFor(() => {
      const { isLoading } = result.current;
      expect(isLoading).toBeFalsy();
    });
    expect(isAuthenticated).toBeFalsy();
  });

  test('change from not authenticated to authenticated', async () => {
    isAuthenticated.mockImplementationOnce(() => true);
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    const { isLoading } = result.current;
    expect(isLoading).toBeTruthy();
    await waitFor(() => {
      const { isLoading } = result.current;
      expect(isLoading).toBeFalsy();
    });
    expect(result.current.isAuthenticated).toBeFalsy();
    act(() => {
      result.current.logtoClient?.handleCallback('url');
    });
    expect(result.current.isAuthenticated).toBeTruthy();
  });

  test('change from authenticated to not authenticated', async () => {
    isAuthenticated.mockImplementationOnce(() => true).mockImplementationOnce(() => false);
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    const { isLoading } = result.current;
    expect(isLoading).toBeTruthy();
    await waitFor(() => {
      const { isLoading } = result.current;
      expect(isLoading).toBeFalsy();
    });
    expect(result.current.isAuthenticated).toBeFalsy();
    act(() => {
      result.current.logtoClient?.handleCallback('url');
    });
    expect(result.current.isAuthenticated).toBeTruthy();
    act(() => {
      result.current.logtoClient?.logout('url');
    });
    expect(result.current.isAuthenticated).toBeFalsy();
  });
});
