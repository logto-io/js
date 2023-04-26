import type { Session, SessionStorage } from '@remix-run/node';
import { createSession } from '@remix-run/node';

import { createStorage } from '../infrastructure/logto/create-storage.js';
import type { CreateLogtoAdapter, LogtoContext } from '../infrastructure/logto/index.js';

const context: LogtoContext = {
  isAuthenticated: true,
  claims: {
    email: 'test@test.io',
    aud: '',
    exp: 1_665_684_317,
    iat: 1_665_684_318,
    iss: '',
    sub: '',
  },
};

export const getContext = jest.fn(async () => ({
  context,
}));

const session = createSession();
export const storage = createStorage(session);

export const handleSignIn = jest.fn(async () => ({
  session,
  navigateToUrl: '/success-handle-sign-in',
}));

export const handleSignInCallback = jest.fn(async () => ({
  session,
}));

export const handleSignOut = jest.fn(async () => ({
  navigateToUrl: '/success-handle-sign-out',
}));

export const createLogtoAdapter: CreateLogtoAdapter = jest.fn((session: Session) => {
  return {
    handleSignIn,
    handleSignInCallback,
    handleSignOut,
    getContext,
  };
});

// eslint-disable-next-line no-restricted-syntax
export const commitSession = jest.fn(async (session: Session) => session.data as unknown as string);
export const destroySession = jest.fn();
export const getSession = jest.fn();

export const sessionStorage: SessionStorage = {
  commitSession,
  destroySession,
  getSession,
};
