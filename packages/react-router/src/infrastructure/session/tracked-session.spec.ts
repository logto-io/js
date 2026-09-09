import { createSession } from 'react-router';

import { TrackedSession } from './tracked-session.js';

describe('infrastructure:session:TrackedSession', () => {
  it('replays mutations without replacing unrelated session data', () => {
    const trackedSession = new TrackedSession(
      createSession({ refreshToken: 'old', theme: 'light' }, 'session-id')
    );

    trackedSession.set('refreshToken', 'new');
    trackedSession.unset('theme');

    const latestSession = createSession(
      { refreshToken: 'other', theme: 'light', concurrent: 'preserved' },
      'session-id'
    );

    trackedSession.applyPendingMutations(latestSession);

    expect(latestSession.data).toEqual({
      refreshToken: 'new',
      concurrent: 'preserved',
    });
  });

  it('replays flash consumption without replacing unrelated data', () => {
    type Data = { concurrent?: string };
    type FlashData = { notice: string };

    const initialSession = createSession<Data, FlashData>({}, 'session-id');
    initialSession.flash('notice', 'read once');
    const trackedSession = new TrackedSession(initialSession);

    expect(trackedSession.get('notice')).toBe('read once');

    const latestSession = createSession<Data, FlashData>({ concurrent: 'preserved' }, 'session-id');
    latestSession.flash('notice', 'read once');

    trackedSession.applyPendingMutations(latestSession);

    expect(latestSession.data).toEqual({ concurrent: 'preserved' });
  });

  it('replays flash writes', () => {
    type Data = { concurrent?: string };
    type FlashData = { notice: string };

    const trackedSession = new TrackedSession(createSession<Data, FlashData>({}, 'session-id'));
    trackedSession.flash('notice', 'read once');

    const latestSession = createSession<Data, FlashData>({ concurrent: 'preserved' }, 'session-id');
    trackedSession.applyPendingMutations(latestSession);

    expect(latestSession.get('notice')).toBe('read once');
    expect(latestSession.data).toEqual({ concurrent: 'preserved' });
  });

  it('clears pending mutations after adopting a committed session', () => {
    const trackedSession = new TrackedSession(createSession({ value: 'old' }, 'session-id'));

    trackedSession.set('value', 'new');
    expect(trackedSession.hasPendingMutations).toBe(true);

    trackedSession.adopt(createSession({ value: 'committed' }, 'session-id'));

    expect(trackedSession.hasPendingMutations).toBe(false);
    expect(trackedSession.get('value')).toBe('committed');
  });
});
