import { createProcessLocalSessionCoordinator } from './session-coordinator.js';

const delay = async (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

describe('infrastructure:session:sessionCoordinator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes operations for the same session', async () => {
    vi.useFakeTimers();

    const coordinator = createProcessLocalSessionCoordinator();
    const firstStart = vi.fn();
    const firstEnd = vi.fn();
    const secondStart = vi.fn();

    const first = coordinator.runExclusive('session', async () => {
      firstStart();
      await delay(25);
      firstEnd();
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(firstStart).toHaveBeenCalledOnce();

    const second = coordinator.runExclusive('session', async () => {
      secondStart();
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(secondStart).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(25);
    await Promise.all([first, second]);

    expect(firstEnd.mock.invocationCallOrder[0]).toBeLessThan(
      secondStart.mock.invocationCallOrder[0] ?? 0
    );
  });

  it('allows operations for different sessions to run concurrently', async () => {
    vi.useFakeTimers();

    const coordinator = createProcessLocalSessionCoordinator();
    const firstStart = vi.fn();
    const firstEnd = vi.fn();
    const secondStart = vi.fn();

    const first = coordinator.runExclusive('first-session', async () => {
      firstStart();
      await delay(25);
      firstEnd();
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(firstStart).toHaveBeenCalledOnce();

    await coordinator.runExclusive('second-session', async () => {
      secondStart();
    });

    expect(secondStart).toHaveBeenCalledOnce();
    expect(firstEnd).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(25);
    await first;
  });

  it('releases the session after an operation fails', async () => {
    const coordinator = createProcessLocalSessionCoordinator();

    await expect(
      coordinator.runExclusive('session', async () => {
        throw new Error('failed');
      })
    ).rejects.toThrow('failed');

    await expect(coordinator.runExclusive('session', async () => 'completed')).resolves.toBe(
      'completed'
    );
  });
});
