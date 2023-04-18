import LogtoClient from '@logto/browser';
import { renderHook, act } from '@testing-library/react-hooks';
import { ComponentType } from 'react';

import { useHandleSignInCallback, useLogto } from '.';
import { LogtoProvider } from '../provider';

const isAuthenticated = jest.fn(() => false);
const isSignInRedirected = jest.fn(() => false);
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
  ({ children }: { children: ComponentType<unknown> }) =>
    <LogtoProvider config={{ endpoint, appId }}>{children}</LogtoProvider>;

describe('useLogto', () => {
  test('without provider should throw', () => {
    const { result } = renderHook(() => useLogto());
    expect(result.error).not.toBeUndefined();
  });

  test('useLogto should call LogtoClient constructor', async () => {
    await act(async () => {
      renderHook(() => useLogto(), {
        wrapper: createHookWrapper(),
      });
    });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, appId });
  });

  test('useLogto should return LogtoClient property methods', async () => {
    await act(async () => {
      const { result, waitFor } = renderHook(() => useLogto(), {
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

  test('not in callback url should not call `handleSignInCallback`', async () => {
    await act(async () => {
      renderHook(
        () => {
          useHandleSignInCallback();
        },
        {
          wrapper: createHookWrapper(),
        }
      );
    });
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  test('in callback url should call `handleSignInCallback`', async () => {
    isSignInRedirected.mockImplementation(() => true);

    await act(async () => {
      renderHook(
        () => {
          useHandleSignInCallback();
        },
        {
          wrapper: createHookWrapper(),
        }
      );
      isAuthenticated.mockImplementation(() => true);
    });
    expect(handleSignInCallback).toHaveBeenCalledTimes(1);
  });

  test('useLogto hook should return error when getAccessToken fails', async () => {
    await act(async () => {
      const { result, waitFor } = renderHook(() => useLogto(), {
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
