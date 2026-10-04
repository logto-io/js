import type { AccessTokenClaims, IdTokenClaims, LogtoContext } from '@logto/node';
import type { Session, SessionData, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import {
  createProcessLocalSessionCoordinator,
  SessionRuntime,
} from '../infrastructure/session/index.js';

import type { CreateLogtoRequestClient } from './request-context.js';
import { createLogtoRequestContext } from './request-context.js';

const sessionCookie = 'logto-session=session-id';

const createTestSessionStorage = (initialData: SessionData) => {
  const sessions = new Map<string, SessionData>([['session-id', structuredClone(initialData)]]);
  const commitSession = vi.fn(async (session: Session) => {
    sessions.set('session-id', structuredClone(session.data));
    return `${sessionCookie}; Path=/; HttpOnly`;
  });
  const sessionStorage: SessionStorage = {
    getSession: async () =>
      createSession(structuredClone(sessions.get('session-id') ?? {}), 'session-id'),
    commitSession,
    destroySession: async () => `${sessionCookie}; Max-Age=0`,
  };

  return {
    sessionStorage,
    commitSession,
    getData: () => structuredClone(sessions.get('session-id') ?? {}),
  };
};

const idTokenClaims: IdTokenClaims = {
  aud: 'app-id',
  exp: 1_700_000_000,
  iat: 1_600_000_000,
  iss: 'https://logto.example.com/oidc',
  sub: 'user-id',
};

const createClient: CreateLogtoRequestClient = (session) => ({
  getContext: async () => ({ isAuthenticated: false }) satisfies LogtoContext,
  getIdTokenClaims: async () => idTokenClaims,
  getAccessToken: async () => 'access-token',
  getAccessTokenClaims: async () => ({}) satisfies AccessTokenClaims,
  getOrganizationToken: async () => 'organization-token',
  getOrganizationTokenClaims: async () => ({}) satisfies AccessTokenClaims,
  clearAccessToken: async () => {
    session.unset('accessToken');
  },
  clearAllTokens: async () => {
    session.unset('accessToken');
    session.unset('idToken');
    session.unset('refreshToken');
  },
});

describe('middleware:createLogtoRequestContext token clearing', () => {
  it('persists access-token and all-token clearing through session checkpoints', async () => {
    const store = createTestSessionStorage({
      accessToken: 'cached-access-token',
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await context.clearAccessToken();
    expect(store.getData()).toEqual({ idToken: 'id-token', refreshToken: 'refresh-token' });

    await context.clearAllTokens();
    expect(store.getData()).toEqual({});
    expect(store.commitSession).toHaveBeenCalledTimes(2);
  });
});
