import LogtoClient from '@logto/browser';
import { renderHook, act } from '@testing-library/react-hooks';
import React, { ComponentType } from 'react';

import { useLogto, useHandleSignInCallback } from '.';
import { LogtoProvider } from '../provider';

const isSignInRedirected = jest.fn(() => false);
const handleSignInCallback = jest.fn(async () => Promise.resolve());

jest.mock('@logto/browser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isSignInRedirected,
      handleSignInCallback,
      signIn: jest.fn(async () => Promise.resolve()),
      signOut: jest.fn(async () => Promise.resolve()),
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
      const { signIn, signOut, fetchUserInfo, getAccessToken, getIdTokenClaims } = result.current;

      expect(result.error).toBeUndefined();
      expect(signIn).not.toBeUndefined();
      expect(signOut).not.toBeUndefined();
      expect(fetchUserInfo).not.toBeUndefined();
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
});
