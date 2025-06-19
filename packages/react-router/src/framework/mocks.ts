import type { Session, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

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

export const getContext = vi.fn(async () => ({
  context,
}));

const session = createSession();
export const storage = createStorage(session);

export const handleSignIn = vi.fn(async () => ({
  session,
  navigateToUrl: '/success-handle-sign-in',
}));

export const handleSignInCallback = vi.fn(async () => ({
  session,
}));

export const handleSignOut = vi.fn(async () => ({
  navigateToUrl: '/success-handle-sign-out',
}));

export const handleSignUp = vi.fn(async () => ({
  session,
  navigateToUrl: '/success-handle-sign-up',
}));

export const createLogtoAdapter: CreateLogtoAdapter = vi.fn((session: Session) => {
  return {
    handleSignIn,
    handleSignInCallback,
    handleSignOut,
    handleSignUp,
    getContext,
  };
});

// eslint-disable-next-line no-restricted-syntax
export const commitSession = vi.fn(async (session: Session) => session.data as unknown as string);
export const destroySession = vi.fn();
export const getSession = vi.fn();

export const sessionStorage: SessionStorage = {
  commitSession,
  destroySession,
  getSession,
};
