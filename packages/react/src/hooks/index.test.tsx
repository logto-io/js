import LogtoClient from '@logto/browser';
import { renderHook, act } from '@testing-library/react-hooks';
import React, { ComponentType } from 'react';

import useLogto from '.';
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
const clientId = 'foo';

const createHookWrapper =
  () =>
  ({ children }: { children: ComponentType<unknown> }) =>
    <LogtoProvider logtoConfig={{ endpoint, clientId }}>{children}</LogtoProvider>;

describe('useLogto', () => {
  test('without provider should throw', () => {
    const { result } = renderHook(() => useLogto());
    expect(result.error).not.toBeUndefined();
  });

  test('useLogto should call LogtoClient constructor', () => {
    renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });

    expect(LogtoClient).toHaveBeenCalledWith({ endpoint, clientId });
  });

  test('useLogto should return LogtoClient property methods', async () => {
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });

    await waitFor(() => {
      const { signIn, signOut, handleSignInCallback } = result.current;

      expect(signIn).not.toBeUndefined();
      expect(signOut).not.toBeUndefined();
      expect(handleSignInCallback).not.toBeUndefined();
    });
  });

  test('not in callback url should not call `handleSignInCallback`', async () => {
    const { result } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    await act(async () => result.current.signIn('redirectUri'));
    expect(handleSignInCallback).not.toHaveBeenCalled();
  });

  test('in callback url should call `handleSignInCallback`', async () => {
    isSignInRedirected.mockImplementation(() => true);
    const { result, waitFor } = renderHook(() => useLogto(), {
      wrapper: createHookWrapper(),
    });
    await act(async () => result.current.signIn('redirectUri'));
    await waitFor(() => {
      expect(handleSignInCallback).toHaveBeenCalledTimes(1);
    });
  });
});
