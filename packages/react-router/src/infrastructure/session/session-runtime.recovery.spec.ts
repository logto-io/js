import type { Session, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import { createProcessLocalSessionCoordinator } from './session-coordinator.js';
import { SessionRuntime } from './session-runtime.js';

type TestSessionData = {
  refreshToken?: string;
};

const createTestSessionStorage = () => {
  const sessions = new Map<string, TestSessionData>([['session-id', { refreshToken: 'old' }]]);
  const getSession = vi.fn(async () =>
    createSession(structuredClone(sessions.get('session-id') ?? {}), 'session-id')
  );
  const commitSession = vi.fn(async (session: Session<TestSessionData>) => {
    sessions.set(session.id, structuredClone(session.data));

    return `logto-session=${session.id}; Path=/; HttpOnly`;
  });
  const sessionStorage: SessionStorage<TestSessionData> = {
    getSession,
    commitSession,
    destroySession: async () => 'logto-session=; Max-Age=0',
  };

  return {
    sessionStorage,
    getSession,
    commitSession,
    getData: () => structuredClone(sessions.get('session-id') ?? {}),
  };
};

const createRuntime = async (sessionStorage: SessionStorage<TestSessionData>) =>
  SessionRuntime.create({
    cookieHeader: 'logto-session=session-id',
    sessionStorage,
    sessionCoordinator: createProcessLocalSessionCoordinator(),
  });

describe('infrastructure:session:SessionRuntime recovery', () => {
  it('preserves a checkpoint error when the committed session reload fails', async () => {
    const store = createTestSessionStorage();
    const runtime = await createRuntime(store.sessionStorage);
    const checkpointError = new Error('refresh failed');
    const reloadError = new Error('database unavailable');

    await expect(
      runtime.checkpoint(async (session) => {
        session.set('refreshToken', 'rotated');
        store.getSession.mockRejectedValueOnce(reloadError);
        throw checkpointError;
      })
    ).rejects.toBe(checkpointError);

    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(runtime.session.get('refreshToken')).toBe('rotated');
    expect(runtime.session.hasPendingMutations).toBe(false);
    expect(store.commitSession).toHaveBeenCalledOnce();
  });

  it('surfaces a committed session reload error after a successful checkpoint', async () => {
    const store = createTestSessionStorage();
    const runtime = await createRuntime(store.sessionStorage);
    const reloadError = new Error('database unavailable');

    await expect(
      runtime.checkpoint(async (session) => {
        session.set('refreshToken', 'rotated');
        store.getSession.mockRejectedValueOnce(reloadError);
      })
    ).rejects.toBe(reloadError);

    expect(store.getData()).toEqual({ refreshToken: 'rotated' });
    expect(runtime.session.get('refreshToken')).toBe('rotated');
    expect(runtime.session.hasPendingMutations).toBe(false);
    expect(store.commitSession).toHaveBeenCalledOnce();
  });
});
