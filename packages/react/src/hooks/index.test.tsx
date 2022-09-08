/* eslint-disable @typescript-eslint/no-empty-function */
import LogtoClient from '@logto/browser';
import { renderHook, act } from '@testing-library/react-hooks';
import { ComponentType } from 'react';

import { useLogto, useHandleSignInCallback } from '.';
import { LogtoProvider } from '../provider';

const isAuthenticated = jest.fn(() => false);
const isSignInRedirected = jest.fn(() => false);
const handleSignInCallback = jest.fn(async () => 0);
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
      signIn: jest.fn(async () => {}),
      signOut: jest.fn(async () => {}),
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

  test('useLogto should call LogtoClient constructor', () => {
    renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, appId });
  });

  test('useLogto should return LogtoClient property methods', async () => {
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      const { signIn, signOut, getAccessToken, getIdTokenClaims } = result.current;

      expect(result.error).toBeUndefined();
      expect(signIn).not.toBeUndefined();
      expect(signOut).not.toBeUndefined();
      expect(getAccessToken).not.toBeUndefined();
      expect(getIdTokenClaims).not.toBeUndefined();
    });
  });

  test('not in callback url should not call `handleSignInCallback`', async () => {
    const { result } = renderHook(
      () => {
        useHandleSignInCallback();

        return useLogto();
      },
      {
        wrapper: createHookWrapper(),
      }
    );
    await act(async () => result.current.signIn('redirectUri'));
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  test('in callback url should call `handleSignInCallback`', async () => {
    isSignInRedirected.mockImplementation(() => true);
    const { result, waitFor } = renderHook(
      () => {
        useHandleSignInCallback();

        return useLogto();
      },
      {
        wrapper: createHookWrapper(),
      }
    );
    await act(async () => result.current.signIn('redirectUri'));
    await waitFor(() => {
      expect(handleSignInCallback).toHaveBeenCalledTimes(1);
    });
  });

  test('useLogto hook should return error when getAccessToken fails', async () => {
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
/* eslint-enable @typescript-eslint/no-empty-function */
