import type { Session, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import {
  createProcessLocalSessionCoordinator,
  type SessionCoordinator,
} from './session-coordinator.js';
import { SessionRuntime } from './session-runtime.js';
import type { TrackedSession } from './tracked-session.js';

type TestSessionData = {
  refreshToken?: string;
  idToken?: string;
  locale?: string;
  theme?: string;
  pending?: string;
};

const sessionCookie = 'logto-session=session-id';

const delay = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const getSessionId = (cookieHeader: string | undefined) =>
  /logto-session=([^;]+)/.exec(cookieHeader ?? '')?.[1] ?? '';

const createTestSessionStorage = (
  initialData: TestSessionData,
  beforeCommit?: () => Promise<void>
) => {
  const sessions = new Map<string, TestSessionData>([['session-id', structuredClone(initialData)]]);

  const commitSession = vi.fn(async (session: Session<TestSessionData>) => {
    await beforeCommit?.();
    sessions.set(session.id, structuredClone(session.data));
    const cookiePath = session.has('theme') ? 'final' : 'checkpoint';

    return `logto-session=${session.id}; Path=/${cookiePath}; HttpOnly`;
  });
  const destroySession = vi.fn(async (session: Session<TestSessionData>) => {
    sessions.delete(session.id);

    return 'logto-session=; Max-Age=0';
  });

  const getSession = vi.fn(async (cookieHeader: string | undefined) => {
    const sessionId = getSessionId(cookieHeader ?? undefined);
    const data = sessions.get(sessionId) ?? {};

    return createSession(structuredClone(data), sessionId);
  });

  const sessionStorage: SessionStorage<TestSessionData> = {
    getSession: async (cookieHeader) => getSession(cookieHeader ?? undefined),
    commitSession,
    destroySession,
  };

  return {
    sessionStorage,
    getData: () => structuredClone(sessions.get('session-id') ?? {}),
    getSession,
    commitSession,
    destroySession,
  };
};

const createRuntime = async (
  sessionStorage: SessionStorage<TestSessionData>,
  sessionCoordinator = createProcessLocalSessionCoordinator()
) =>
  SessionRuntime.create({
    cookieHeader: sessionCookie,
    sessionStorage,
    sessionCoordinator,
  });

describe('infrastructure:session:SessionRuntime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('merges delayed mutations into the latest committed session', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old', locale: 'en' });
    const coordinator = createProcessLocalSessionCoordinator();
    const delayedRuntime = await createRuntime(store.sessionStorage, coordinator);
    const refreshRuntime = await createRuntime(store.sessionStorage, coordinator);

    delayedRuntime.session.set('theme', 'dark');

    await refreshRuntime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });
    await delayedRuntime.finalize();

    expect(store.getData()).toEqual({
      refreshToken: 'rotated',
      locale: 'en',
      theme: 'dark',
    });
    expect(store.commitSession).toHaveBeenCalledTimes(2);
  });

  it('uses the stable session ID as the coordination key', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const observeSessionKey = vi.fn();
    const sessionCoordinator: SessionCoordinator = {
      runExclusive: async (sessionKey, operation) => {
        observeSessionKey(sessionKey);
        return operation();
      },
    };
    const runtime = await createRuntime(store.sessionStorage, sessionCoordinator);

    runtime.session.set('theme', 'dark');
    await runtime.finalize();

    expect(observeSessionKey).toHaveBeenCalledOnce();
    expect(observeSessionKey).toHaveBeenCalledWith('session-id');
  });

  it('does not share coordination keys for cookie-only sessions', async () => {
    const observeSessionKey = vi.fn();
    const sessionCoordinator: SessionCoordinator = {
      runExclusive: async (sessionKey, operation) => {
        observeSessionKey(sessionKey);
        return operation();
      },
    };
    const sessionStorage: SessionStorage<TestSessionData> = {
      getSession: async () => createSession<TestSessionData>({}),
      commitSession: async () => 'logto-session=value; Path=/',
      destroySession: async () => 'logto-session=; Max-Age=0',
    };
    const firstRuntime = await createRuntime(sessionStorage, sessionCoordinator);
    const secondRuntime = await createRuntime(sessionStorage, sessionCoordinator);

    firstRuntime.session.set('theme', 'dark');
    secondRuntime.session.set('theme', 'dark');
    await Promise.all([firstRuntime.finalize(), secondRuntime.finalize()]);

    expect(observeSessionKey).toHaveBeenCalledTimes(2);
    expect(observeSessionKey.mock.calls[0]?.[0]).not.toBe(observeSessionKey.mock.calls[1]?.[0]);
  });

  it('reloads the session inside the coordinator before refreshing', async () => {
    vi.useFakeTimers();

    const store = createTestSessionStorage({ refreshToken: 'old' });
    const coordinator = createProcessLocalSessionCoordinator();
    const firstRuntime = await createRuntime(store.sessionStorage, coordinator);
    const secondRuntime = await createRuntime(store.sessionStorage, coordinator);
    const rotateRefreshToken = vi.fn(async (session: TrackedSession<TestSessionData>) => {
      await delay(10);
      session.set('refreshToken', 'rotated');
    });
    const refresh = async (runtime: SessionRuntime<TestSessionData>) =>
      runtime.checkpoint(async (session) => {
        if (session.get('refreshToken') === 'old') {
          await rotateRefreshToken(session);
        }
      });

    const first = refresh(firstRuntime);
    await vi.advanceTimersByTimeAsync(0);
    expect(rotateRefreshToken).toHaveBeenCalledOnce();

    const second = refresh(secondRuntime);
    await vi.advanceTimersByTimeAsync(10);
    await Promise.all([first, second]);

    expect(rotateRefreshToken).toHaveBeenCalledOnce();
    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(secondRuntime.session.get('refreshToken')).toBe('rotated');
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('keeps pending mutations when a checkpoint fails', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await createRuntime(store.sessionStorage);

    runtime.session.set('theme', 'dark');

    await expect(
      runtime.checkpoint(async (session) => {
        session.set('refreshToken', 'not-committed');
        throw new Error('refresh failed');
      })
    ).rejects.toThrow('refresh failed');

    expect(store.getData()).toEqual({ refreshToken: 'old' });
    expect(runtime.session.get('theme')).toBe('dark');

    await runtime.finalize();

    expect(store.getData()).toEqual({ refreshToken: 'old', theme: 'dark' });
  });

  it('commits mutations made through the request session during a checkpoint', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await createRuntime(store.sessionStorage);

    await runtime.checkpoint(async () => {
      runtime.session.set('theme', 'dark');
    });

    expect(store.getData()).toEqual({ refreshToken: 'old', theme: 'dark' });
    expect(store.commitSession).toHaveBeenCalledOnce();
    expect(runtime.session.hasPendingMutations).toBe(false);
  });

  it('retains request mutations made while a checkpoint commit is pending', async () => {
    vi.useFakeTimers();

    const commitStarted = vi.fn();
    const store = createTestSessionStorage({ refreshToken: 'old' }, async () => {
      commitStarted();
      await delay(25);
    });
    const runtime = await createRuntime(store.sessionStorage);

    const checkpoint = runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(commitStarted).toHaveBeenCalledOnce();

    runtime.session.set('theme', 'dark');
    await vi.advanceTimersByTimeAsync(25);
    await checkpoint;

    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(runtime.session.hasPendingMutations).toBe(true);
    expect(runtime.session.get('theme')).toBe('dark');

    const finalize = runtime.finalize();

    await vi.advanceTimersByTimeAsync(25);
    await finalize;

    expect(store.getData()).toEqual({ refreshToken: 'rotated', theme: 'dark' });
  });

  it('returns the newest cookie header produced by the request', async () => {
    const store = createTestSessionStorage({ refreshToken: 'old' });
    const runtime = await createRuntime(store.sessionStorage);

    await runtime.checkpoint(async (session) => {
      session.set('refreshToken', 'rotated');
    });
    expect(runtime.getResponseCookieHeader()).toBe(
      'logto-session=session-id; Path=/checkpoint; HttpOnly'
    );

    runtime.session.set('theme', 'dark');

    const cookieHeader = await runtime.finalize();

    expect(cookieHeader).toBe('logto-session=session-id; Path=/final; HttpOnly');
    expect(store.getSession).toHaveBeenLastCalledWith('logto-session=session-id');
  });

  it('destroys the latest session as a coordinated checkpoint', async () => {
    const store = createTestSessionStorage({ idToken: 'id-token' });
    const runtime = await createRuntime(store.sessionStorage);

    runtime.session.set('pending', 'value');

    const idToken = await runtime.destroy(async (session) => session.get('idToken'));

    expect(idToken).toBe('id-token');
    expect(store.getData()).toEqual({});
    expect(store.destroySession).toHaveBeenCalledOnce();
    expect(runtime.session.data).toEqual({});
    await expect(runtime.finalize()).resolves.toBe('logto-session=; Max-Age=0');
    await expect(runtime.checkpoint(async () => true)).rejects.toThrow(
      'Cannot update a destroyed session.'
    );
  });
});
