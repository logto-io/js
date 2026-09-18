import type { Session, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import type { SessionCoordinator } from './session-coordinator.js';
import { SessionRuntime } from './session-runtime.js';

type TestSessionData = {
  refreshToken?: string;
  idToken?: string;
  theme?: string;
};

const delay = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const getSessionId = (cookieHeader: string | undefined) =>
  /logto-session=([^;]+)/.exec(cookieHeader ?? '')?.[1] ?? '';

const createSessionBackend = (existingSessionId?: string) => {
  const createdSessionId = existingSessionId ?? 'created-session-id';
  const sessions = new Map<string, TestSessionData>();
  const sessionAliases = new Map<string, string>();
  // eslint-disable-next-line @silverhand/fp/no-let
  let activeSessionId: string | undefined;
  // eslint-disable-next-line @silverhand/fp/no-let
  let currentSessionId = createdSessionId;
  // eslint-disable-next-line @silverhand/fp/no-let
  let nextSessionId: string | undefined;

  if (existingSessionId) {
    sessions.set(existingSessionId, { refreshToken: 'old' });
  }

  const getSession = vi.fn(async (cookieHeader: string | undefined) => {
    const cookieSessionId = getSessionId(cookieHeader);
    const sessionId = sessionAliases.get(cookieSessionId) ?? cookieSessionId;
    const data = sessions.get(sessionId) ?? {};

    return createSession(structuredClone(data), sessionId);
  });
  const commitSession = vi.fn(async (session: Session<TestSessionData>) => {
    if (session.id && activeSessionId !== session.id) {
      throw new Error(`Missing coordinator lease for session ${session.id}.`);
    }

    const sessionId = (nextSessionId ?? session.id) || createdSessionId;

    if (session.id && session.id !== sessionId) {
      sessions.delete(session.id);
    }

    sessions.set(sessionId, structuredClone(session.data));
    // eslint-disable-next-line @silverhand/fp/no-mutation
    currentSessionId = sessionId;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    nextSessionId = undefined;

    return `logto-session=${sessionId}; Path=/; HttpOnly`;
  });
  const destroySession = vi.fn(async (session: Session<TestSessionData>) => {
    if (session.id && activeSessionId !== session.id) {
      throw new Error(`Missing coordinator lease for session ${session.id}.`);
    }

    sessions.delete(session.id);

    return 'logto-session=; Max-Age=0';
  });
  const sessionStorage: SessionStorage<TestSessionData> = {
    getSession: async (cookieHeader) => getSession(cookieHeader ?? undefined),
    commitSession,
    destroySession,
  };

  const runExclusive = vi.fn();
  const sessionCoordinator: SessionCoordinator = {
    runExclusive: async (sessionKey, operation) => {
      runExclusive(sessionKey);
      const previousSessionId = activeSessionId;

      // eslint-disable-next-line @silverhand/fp/no-mutation
      activeSessionId = sessionKey;

      try {
        return await operation();
      } finally {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        activeSessionId = previousSessionId;
      }
    },
  };

  return {
    createdSessionId,
    sessionStorage,
    sessionCoordinator,
    runExclusive,
    getSession,
    getData: () => structuredClone(sessions.get(currentSessionId) ?? {}),
    commitSession,
    destroySession,
    rotateOnNextCommit: (sessionId: string) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      nextSessionId = sessionId;
    },
    replaceStoredSessionId: (currentId: string, nextId: string) => {
      const data = sessions.get(currentId) ?? {};

      sessions.delete(currentId);
      sessions.set(nextId, data);
      sessionAliases.set(currentId, nextId);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      currentSessionId = nextId;
    },
  };
};

describe('infrastructure:session:SessionRuntime coordination', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the configured coordinator with the persistent session ID', async () => {
    const backend = createSessionBackend('session-id');
    const runtime = await SessionRuntime.create({
      cookieHeader: 'logto-session=session-id',
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });

    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(backend.runExclusive).toHaveBeenCalledOnce();
    expect(backend.runExclusive).toHaveBeenCalledWith('session-id');
  });

  it('uses request-local coordination when the loaded session has no ID', async () => {
    const backend = createSessionBackend();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });

    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(backend.runExclusive).not.toHaveBeenCalled();
    expect(backend.getData()).toEqual({ theme: 'dark' });
  });

  it('hands a queued checkpoint to persistent coordination after creating an ID', async () => {
    vi.useFakeTimers();

    const backend = createSessionBackend();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });
    const observeOperation = vi.fn();
    const first = runtime.checkpoint(async (session) => {
      observeOperation('first:start');
      await delay(10);
      session.set('refreshToken', 'rotated');
      observeOperation('first:end');
    });

    await vi.advanceTimersByTimeAsync(0);

    const second = runtime.checkpoint(async (session) => {
      session.set('idToken', 'id-token');
      observeOperation('second');
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(observeOperation.mock.calls).toEqual([['first:start']]);

    await vi.advanceTimersByTimeAsync(10);
    await Promise.all([first, second]);

    expect(observeOperation.mock.calls).toEqual([['first:start'], ['first:end'], ['second']]);
    expect(backend.runExclusive).toHaveBeenCalledOnce();
    expect(backend.runExclusive).toHaveBeenCalledWith(backend.createdSessionId);
    expect(backend.getData()).toEqual({ refreshToken: 'rotated', idToken: 'id-token' });
  });

  it('coordinates later checkpoints and finalization after the first commit creates an ID', async () => {
    const backend = createSessionBackend();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });

    await runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });
    await runtime.checkpoint(async (session) => {
      session.set('idToken', 'id-token');
    });
    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(runtime.session.id).toBe(backend.createdSessionId);
    expect(backend.runExclusive.mock.calls).toEqual([
      [backend.createdSessionId],
      [backend.createdSessionId],
    ]);
    expect(backend.getData()).toEqual({
      refreshToken: 'rotated',
      idToken: 'id-token',
      theme: 'dark',
    });
    expect(backend.commitSession).toHaveBeenCalledTimes(3);
  });

  it('coordinates destruction after the first commit creates an ID', async () => {
    const backend = createSessionBackend();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });

    await runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });
    await runtime.destroy(async () => true);

    expect(backend.runExclusive).toHaveBeenCalledOnce();
    expect(backend.runExclusive).toHaveBeenCalledWith(backend.createdSessionId);
    expect(backend.destroySession).toHaveBeenCalledOnce();
    expect(backend.getData()).toEqual({});
  });

  it('coordinates later checkpoints with a rotated session ID', async () => {
    const backend = createSessionBackend('session-id');
    const runtime = await SessionRuntime.create({
      cookieHeader: 'logto-session=session-id',
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });

    backend.rotateOnNextCommit('rotated-session-id');
    await runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });
    await runtime.checkpoint(async (session) => {
      session.set('idToken', 'id-token');
    });

    expect(runtime.session.id).toBe('rotated-session-id');
    expect(backend.runExclusive.mock.calls).toEqual([['session-id'], ['rotated-session-id']]);
    expect(backend.getData()).toEqual({ refreshToken: 'rotated', idToken: 'id-token' });
  });

  it('retries coordination when the session ID changes before the coordinated reload', async () => {
    const backend = createSessionBackend('session-id');
    const runtime = await SessionRuntime.create({
      cookieHeader: 'logto-session=session-id',
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });

    backend.replaceStoredSessionId('session-id', 'rotated-session-id');

    await runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });

    expect(backend.runExclusive.mock.calls).toEqual([['session-id'], ['rotated-session-id']]);
    expect(runtime.session.id).toBe('rotated-session-id');
    expect(backend.getData()).toEqual({ refreshToken: 'rotated' });
  });

  it('continues request-local coordination when the session ID disappears', async () => {
    const backend = createSessionBackend('session-id');
    const runtime = await SessionRuntime.create({
      cookieHeader: 'logto-session=session-id',
      sessionStorage: backend.sessionStorage,
      sessionCoordinator: backend.sessionCoordinator,
    });
    const observeSessionId = vi.fn();

    backend.getSession.mockResolvedValueOnce(createSession<TestSessionData>());

    await runtime.checkpoint(async (session) => {
      observeSessionId(session.id);
      session.set('refreshToken', 'rotated');
    });

    expect(observeSessionId).toHaveBeenCalledOnce();
    expect(observeSessionId).toHaveBeenCalledWith('');
    expect(backend.runExclusive.mock.calls).toEqual([['session-id']]);
    expect(runtime.session.id).toBe('session-id');
    expect(backend.getData()).toEqual({ refreshToken: 'rotated' });
  });
});
