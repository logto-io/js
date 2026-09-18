import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearSessionCoordination,
  getRotatedSessionCount,
  getRotatedSessionValue,
  recordRotatedSessionValue,
  runSessionExclusive,
} from '../src/runtime/utils/session-coordination';

const createGate = () => {
  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation */
  let open!: () => void;
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */
  return { open, opened };
};

describe('session coordination', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearSessionCoordination();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes operations on the same cookie value', async () => {
    const gate = createGate();
    const order: string[] = [];

    const first = runSessionExclusive('a', async () => {
      await gate.opened;
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      order.push('first');
    });
    const second = runSessionExclusive('a', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      order.push('second');
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(order).toEqual([]);

    gate.open();
    await Promise.all([first, second]);
    expect(order).toEqual(['first', 'second']);
  });

  it('does not block the next operation when the previous one rejects', async () => {
    await expect(
      runSessionExclusive('a', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    await expect(runSessionExclusive('a', async () => 'ok')).resolves.toBe('ok');
  });

  it('locks a rotated cookie on the same session as the cookie it superseded', async () => {
    const gate = createGate();
    const order: string[] = [];

    // A request with cookie A refreshes and mints B while it still holds the lock.
    const withOldCookie = runSessionExclusive('a', async () => {
      recordRotatedSessionValue('a', 'b');
      await gate.opened;
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      order.push('a');
    });
    await vi.advanceTimersByTimeAsync(0);

    // The browser already adopted B; a request carrying B must queue behind A, not run alongside.
    const withNewCookie = runSessionExclusive('b', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      order.push('b');
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(order).toEqual([]);

    gate.open();
    await Promise.all([withOldCookie, withNewCookie]);
    expect(order).toEqual(['a', 'b']);
  });

  it('resolves the latest session value across chained rotations', () => {
    recordRotatedSessionValue('a', 'b');
    recordRotatedSessionValue('b', 'c');

    expect(getRotatedSessionValue('a')).toBe('c');
    expect(getRotatedSessionValue('b')).toBe('c');
    // The caller already holds the freshest value.
    expect(getRotatedSessionValue('c')).toBeUndefined();
  });

  it('forgets a rotation once its window has closed', () => {
    recordRotatedSessionValue('a', 'b');

    vi.advanceTimersByTime(30_000);

    expect(getRotatedSessionValue('a')).toBeUndefined();
  });

  it('evicts expired rotations without a lookup of the superseded cookie', () => {
    // Every refresh of a normal session records one rotation that nobody looks up again.
    for (const index of Array.from({ length: 100 }).keys()) {
      recordRotatedSessionValue(`old_${index}`, `new_${index}`);
    }
    expect(getRotatedSessionCount()).toBe(300);

    vi.advanceTimersByTime(30_000);
    recordRotatedSessionValue('fresh_old', 'fresh_new');

    // Only the record written after the window closed survives.
    expect(getRotatedSessionCount()).toBe(3);
    expect(getRotatedSessionValue('old_0')).toBeUndefined();
    expect(getRotatedSessionValue('fresh_old')).toBe('fresh_new');
  });
});
