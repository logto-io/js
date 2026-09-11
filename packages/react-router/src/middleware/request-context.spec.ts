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

const delay = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const createTestSessionStorage = (initialData: SessionData = {}) => {
  const sessions = new Map<string, SessionData>([['session-id', structuredClone(initialData)]]);

  const getSession = vi.fn(async () =>
    createSession(structuredClone(sessions.get('session-id') ?? {}), 'session-id')
  );
  const commitSession = vi.fn(async (session: Session) => {
    sessions.set('session-id', structuredClone(session.data));

    return `${sessionCookie}; Path=/; HttpOnly`;
  });
  const sessionStorage: SessionStorage = {
    getSession,
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
const accessTokenClaims: AccessTokenClaims = { sub: 'access-token-user-id' };
const organizationTokenClaims: AccessTokenClaims = { sub: 'organization-token-user-id' };
const defaultClaimsClientMethods = {
  getIdTokenClaims: async () => idTokenClaims,
  getAccessTokenClaims: async (_resource?: string, _organizationId?: string) => accessTokenClaims,
  getOrganizationTokenClaims: async (_organizationId: string) => organizationTokenClaims,
};
const authenticatedContext: LogtoContext = {
  isAuthenticated: true,
  claims: idTokenClaims,
};

describe('middleware:createLogtoRequestContext', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads authentication and ID token claims without committing the session', async () => {
    const store = createTestSessionStorage({ idToken: 'id-token' });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const getContext = vi.fn(
      async (_options?: { fetchUserInfo?: boolean }) => authenticatedContext
    );
    const getIdTokenClaims = vi.fn(async () => idTokenClaims);
    const createClient: CreateLogtoRequestClient = () => ({
      ...defaultClaimsClientMethods,
      getContext,
      getIdTokenClaims,
      getAccessToken: async () => 'access-token',
      getOrganizationToken: async () => 'organization-token',
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await expect(context.getContext()).resolves.toEqual(authenticatedContext);
    await expect(context.getIdTokenClaims()).resolves.toEqual(idTokenClaims);
    expect(getContext).toHaveBeenCalledWith();
    expect(getIdTokenClaims).toHaveBeenCalledOnce();
    expect(store.commitSession).not.toHaveBeenCalled();
  });

  it('commits token acquisition before fetching user info', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const getContext = vi.fn(
      async (_options?: { fetchUserInfo?: boolean }) => authenticatedContext
    );
    const getAccessToken = vi.fn(async () => 'access-token');
    const createClient: CreateLogtoRequestClient = (session) => ({
      ...defaultClaimsClientMethods,
      getContext,
      getAccessToken: async () => {
        session.set('refreshToken', 'rotated');
        return getAccessToken();
      },
      getOrganizationToken: async () => 'organization-token',
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await expect(context.getContext({ fetchUserInfo: true })).resolves.toEqual(
      authenticatedContext
    );
    expect(getContext).toHaveBeenNthCalledWith(1);
    expect(getContext).toHaveBeenCalledWith({ fetchUserInfo: true });
    expect(getAccessToken).toHaveBeenCalledOnce();
    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('preserves rotated tokens when fetching user info fails', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const userInfoError = new Error('userinfo unavailable');
    const createClient: CreateLogtoRequestClient = (session) => ({
      ...defaultClaimsClientMethods,
      getContext: async (options) => {
        if (options?.fetchUserInfo) {
          throw userInfoError;
        }

        return authenticatedContext;
      },
      getAccessToken: async () => {
        session.set('refreshToken', 'rotated');
        return 'access-token';
      },
      getOrganizationToken: async () => 'organization-token',
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await expect(context.getContext({ fetchUserInfo: true })).rejects.toBe(userInfoError);
    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('passes token parameters through a session checkpoint', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const getAccessToken = vi.fn(
      async (_resource?: string, _organizationId?: string) => 'access-token'
    );
    const getOrganizationToken = vi.fn(async (_organizationId: string) => 'organization-token');
    const createClient: CreateLogtoRequestClient = (session) => ({
      ...defaultClaimsClientMethods,
      getContext: async () => authenticatedContext,
      getAccessToken: async (resource, organizationId) => {
        session.set('accessToken', 'cached-access-token');
        return getAccessToken(resource, organizationId);
      },
      getOrganizationToken: async (organizationId) => {
        session.set('accessToken', 'cached-organization-token');
        return getOrganizationToken(organizationId);
      },
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await expect(
      context.getAccessToken({ resource: 'https://api.example.com', organizationId: 'org-id' })
    ).resolves.toBe('access-token');
    await expect(context.getOrganizationToken('org-id')).resolves.toBe('organization-token');

    expect(getAccessToken).toHaveBeenCalledWith('https://api.example.com', 'org-id');
    expect(getOrganizationToken).toHaveBeenCalledWith('org-id');
    expect(store.getData()).toEqual({
      refreshToken: 'old',
      accessToken: 'cached-organization-token',
    });
    expect(store.commitSession).toHaveBeenCalledTimes(2);
  });

  it('passes claim parameters through session checkpoints', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const getAccessTokenClaims = vi.fn(
      async (_resource?: string, _organizationId?: string) => accessTokenClaims
    );
    const getOrganizationTokenClaims = vi.fn(
      async (_organizationId: string) => organizationTokenClaims
    );
    const createClient: CreateLogtoRequestClient = (session) => ({
      ...defaultClaimsClientMethods,
      getContext: async () => authenticatedContext,
      getAccessToken: async () => 'access-token',
      getAccessTokenClaims: async (resource, organizationId) => {
        session.set('refreshToken', 'rotated-for-access-token');
        return getAccessTokenClaims(resource, organizationId);
      },
      getOrganizationToken: async () => 'organization-token',
      getOrganizationTokenClaims: async (organizationId) => {
        session.set('refreshToken', 'rotated-for-organization-token');
        return getOrganizationTokenClaims(organizationId);
      },
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await expect(
      context.getAccessTokenClaims('https://api.example.com', 'org-id')
    ).resolves.toEqual(accessTokenClaims);
    await expect(context.getOrganizationTokenClaims('org-id')).resolves.toEqual(
      organizationTokenClaims
    );

    expect(getAccessTokenClaims).toHaveBeenCalledWith('https://api.example.com', 'org-id');
    expect(getOrganizationTokenClaims).toHaveBeenCalledWith('org-id');
    expect(store.getData()).toEqual({ refreshToken: 'rotated-for-organization-token' });
    expect(store.commitSession).toHaveBeenCalledTimes(2);
  });

  it('persists token mutations before propagating a token acquisition error', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator: createProcessLocalSessionCoordinator(),
    });
    const verificationError = new Error('ID token verification failed');
    const createClient: CreateLogtoRequestClient = (session) => ({
      ...defaultClaimsClientMethods,
      getContext: async () => authenticatedContext,
      getAccessToken: async () => {
        session.set('refreshToken', 'rotated');
        throw verificationError;
      },
      getOrganizationToken: async () => 'organization-token',
    });
    const context = createLogtoRequestContext(runtime, createClient);

    await expect(context.getAccessToken()).rejects.toBe(verificationError);
    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('serializes refresh-token rotation across request contexts', async () => {
    vi.useFakeTimers();

    const store = createTestSessionStorage({ refreshToken: 'old' });
    const sessionCoordinator = createProcessLocalSessionCoordinator();
    const firstRuntime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator,
    });
    const secondRuntime = await SessionRuntime.create({
      cookieHeader: sessionCookie,
      sessionStorage: store.sessionStorage,
      sessionCoordinator,
    });
    const rotateRefreshToken = vi.fn(async (session: Session) => {
      await delay(25);
      session.set('refreshToken', 'rotated');
    });
    const createClient: CreateLogtoRequestClient = (session) => ({
      ...defaultClaimsClientMethods,
      getContext: async () => authenticatedContext,
      getAccessToken: async () => {
        if (session.get('refreshToken') === 'old') {
          await rotateRefreshToken(session);
        }

        return 'access-token';
      },
      getOrganizationToken: async () => 'organization-token',
    });
    const firstContext = createLogtoRequestContext(firstRuntime, createClient);
    const secondContext = createLogtoRequestContext(secondRuntime, createClient);

    const firstAccessToken = firstContext.getAccessToken();
    await vi.advanceTimersByTimeAsync(0);
    const secondAccessToken = secondContext.getAccessToken();

    await vi.advanceTimersByTimeAsync(25);
    await expect(Promise.all([firstAccessToken, secondAccessToken])).resolves.toEqual([
      'access-token',
      'access-token',
    ]);

    expect(rotateRefreshToken).toHaveBeenCalledOnce();
    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(store.commitSession).toHaveBeenCalledOnce();
  });
});
