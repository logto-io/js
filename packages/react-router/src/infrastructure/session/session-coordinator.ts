/**
 * Serializes asynchronous session operations by a stable session key.
 *
 * Implementations must invoke each operation once, hold exclusivity until it settles, and
 * propagate its result or error. A slow operation must not be force-released because it may
 * still commit stale state; the operation owns its timeout and cancellation policy.
 */
export type SessionCoordinator = {
  /** Runs an operation exclusively from other operations using the same session key. */
  readonly runExclusive: <Result>(
    sessionKey: string,
    operation: () => Promise<Result>
  ) => Promise<Result>;
};

type ReleaseSessionLock = () => boolean;
type SessionLockWaiter = (release: ReleaseSessionLock) => void;

class SessionLock {
  private locked = false;
  private readonly waiters = new Set<SessionLockWaiter>();

  public readonly acquire = async (): Promise<ReleaseSessionLock> => {
    if (!this.locked) {
      this.locked = true;
      return this.release;
    }

    return new Promise<ReleaseSessionLock>((resolve) => {
      this.waiters.add(resolve);
    });
  };

  private readonly release = () => {
    const nextWaiter = this.waiters.values().next();

    if (!nextWaiter.done) {
      this.waiters.delete(nextWaiter.value);
      nextWaiter.value(this.release);
      return false;
    }

    this.locked = false;
    return true;
  };
}

/**
 * Serializes operations only within the current JavaScript process. Multi-instance deployments
 * need a distributed coordinator together with shared server-side session storage. Acquisition
 * order is not part of this coordinator's contract.
 */
export class ProcessLocalSessionCoordinator implements SessionCoordinator {
  private readonly sessionLocks = new Map<string, SessionLock>();

  public readonly runExclusive = async <Result>(
    sessionKey: string,
    operation: () => Promise<Result>
  ): Promise<Result> => {
    const existingLock = this.sessionLocks.get(sessionKey);
    const sessionLock = existingLock ?? new SessionLock();

    if (!existingLock) {
      this.sessionLocks.set(sessionKey, sessionLock);
    }

    const release = await sessionLock.acquire();

    try {
      return await operation();
    } finally {
      if (release()) {
        this.sessionLocks.delete(sessionKey);
      }
    }
  };
}

export const createProcessLocalSessionCoordinator = (): SessionCoordinator =>
  new ProcessLocalSessionCoordinator();
