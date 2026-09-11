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

const createSessionStorage = (existingSessionId?: string) => {
  const createdSessionId = existingSessionId ?? 'created-session-id';
  const sessions = new Map<string, TestSessionData>();

  if (existingSessionId) {
    sessions.set(existingSessionId, { refreshToken: 'old' });
  }

  const getSession = vi.fn(async (cookieHeader: string | undefined) => {
    const sessionId = getSessionId(cookieHeader);
    const data = sessions.get(sessionId) ?? {};

    return createSession(structuredClone(data), sessionId);
  });
  const commitSession = vi.fn(async (session: Session<TestSessionData>) => {
    const sessionId = session.id || createdSessionId;

    sessions.set(sessionId, structuredClone(session.data));

    return `logto-session=${sessionId}; Path=/; HttpOnly`;
  });
  const destroySession = vi.fn(async (session: Session<TestSessionData>) => {
    sessions.delete(session.id);

    return 'logto-session=; Max-Age=0';
  });
  const sessionStorage: SessionStorage<TestSessionData> = {
    getSession: async (cookieHeader) => getSession(cookieHeader ?? undefined),
    commitSession,
    destroySession,
  };

  return {
    createdSessionId,
    sessionStorage,
    getData: () => structuredClone(sessions.get(createdSessionId) ?? {}),
    commitSession,
  };
};

const createObservedCoordinator = () => {
  const runExclusive = vi.fn();
  const sessionCoordinator: SessionCoordinator = {
    runExclusive: async (sessionKey, operation) => {
      runExclusive(sessionKey);
      return operation();
    },
  };

  return { sessionCoordinator, runExclusive };
};

describe('infrastructure:session:SessionRuntime coordination', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the configured coordinator with the persistent session ID', async () => {
    const store = createSessionStorage('session-id');
    const { sessionCoordinator, runExclusive } = createObservedCoordinator();
    const runtime = await SessionRuntime.create({
      cookieHeader: 'logto-session=session-id',
      sessionStorage: store.sessionStorage,
      sessionCoordinator,
    });

    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(runExclusive).toHaveBeenCalledOnce();
    expect(runExclusive).toHaveBeenCalledWith('session-id');
  });

  it('uses request-local coordination when the loaded session has no ID', async () => {
    const store = createSessionStorage();
    const { sessionCoordinator, runExclusive } = createObservedCoordinator();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: store.sessionStorage,
      sessionCoordinator,
    });

    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(runExclusive).not.toHaveBeenCalled();
    expect(store.getData()).toEqual({ theme: 'dark' });
  });

  it('serializes concurrent checkpoints for a session without an ID', async () => {
    vi.useFakeTimers();

    const store = createSessionStorage();
    const { sessionCoordinator, runExclusive } = createObservedCoordinator();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: store.sessionStorage,
      sessionCoordinator,
    });
    const observeOperation = vi.fn();
    const first = runtime.checkpoint(async () => {
      observeOperation('first:start');
      await delay(10);
      observeOperation('first:end');
    });

    await vi.advanceTimersByTimeAsync(0);

    const second = runtime.checkpoint(async () => {
      observeOperation('second');
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(observeOperation.mock.calls).toEqual([['first:start']]);

    await vi.advanceTimersByTimeAsync(10);
    await Promise.all([first, second]);

    expect(observeOperation.mock.calls).toEqual([['first:start'], ['first:end'], ['second']]);
    expect(runExclusive).not.toHaveBeenCalled();
  });

  it('keeps request-local coordination after the first commit creates an ID', async () => {
    const store = createSessionStorage();
    const { sessionCoordinator, runExclusive } = createObservedCoordinator();
    const runtime = await SessionRuntime.create({
      cookieHeader: undefined,
      sessionStorage: store.sessionStorage,
      sessionCoordinator,
    });

    await runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });
    await runtime.checkpoint(async (session) => {
      session.set('idToken', 'id-token');
    });
    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(runtime.session.id).toBe(store.createdSessionId);
    expect(runExclusive).not.toHaveBeenCalled();
    expect(store.getData()).toEqual({
      refreshToken: 'rotated',
      idToken: 'id-token',
      theme: 'dark',
    });
    expect(store.commitSession).toHaveBeenCalledTimes(3);
  });
});
