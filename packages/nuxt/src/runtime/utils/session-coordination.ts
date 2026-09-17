/**
 * Process-local coordination for access token requests.
 *
 * Concurrent requests carry the same session cookie, so each request-scoped client would refresh
 * with the same refresh token. Refresh token rotation invalidates a refresh token once it is used,
 * and reusing it trips reuse detection: the token endpoint answers `invalid_grant` and the session
 * is cleared, signing the user out. The lock serializes the requests, and the rotated session
 * value is shared so a queued request continues from the refreshed session instead of the stale
 * cookie it arrived with.
 *
 * Coordination is limited to the current JavaScript process. Multi-instance deployments need
 * shared server-side session storage with a distributed lock; cookie-only sessions cannot be
 * coordinated across instances.
 */

type RotatedSession = {
  /** The latest wrapped session cookie value minted for the session. */
  value: string;
  expiresAt: number;
};

/**
 * How long a rotated session value is kept for requests that were already in flight with the
 * previous cookie. The window only has to cover the round trip of the response that delivered
 * the new cookie.
 */
const rotatedSessionTtlMs = 30_000;

const sessionLocks = new Map<string, Promise<void>>();
const rotatedSessions = new Map<string, RotatedSession>();

/**
 * Runs `operation` exclusively from other operations with the same session key. A rejected
 * operation does not poison the queue for the next caller.
 */
export const runSessionExclusive = async <Result>(
  sessionKey: string,
  operation: () => Promise<Result>
): Promise<Result> => {
  const previous = sessionLocks.get(sessionKey) ?? Promise.resolve();

  // The promise chain is the lock: each caller queues behind the previous one, so `.then()` is
  // intentional here.
  // eslint-disable-next-line promise/prefer-await-to-then
  const run = previous.then(async () => operation());
  // The queued promise must never reject, or one failed operation would block the next one.
  const queued = (async () => {
    try {
      await run;
    } catch {
      // The caller of `run` observes its own error; the queue only cares that it settled.
    }
  })();
  sessionLocks.set(sessionKey, queued);

  try {
    return await run;
  } finally {
    if (sessionLocks.get(sessionKey) === queued) {
      sessionLocks.delete(sessionKey);
    }
  }
};

/**
 * Returns the freshest session value minted for a session whose request cookie was
 * `sessionValue`, or `undefined` when no in-flight rotation is known.
 */
export const getRotatedSessionValue = (sessionValue: string): string | undefined => {
  const rotated = rotatedSessions.get(sessionValue);

  if (!rotated) {
    return undefined;
  }

  if (rotated.expiresAt <= Date.now()) {
    rotatedSessions.delete(sessionValue);
    return undefined;
  }

  return rotated.value;
};

/**
 * Remembers the session value minted by a request so concurrent requests that still carry an
 * older cookie can adopt it. Every superseded value maps to the new one, including the value
 * adopted from an earlier rotation, so chained refreshes cannot strand a request on a consumed
 * refresh token.
 */
export const recordRotatedSessionValue = (supersededValues: string[], value: string): void => {
  const expiresAt = Date.now() + rotatedSessionTtlMs;

  for (const supersededValue of supersededValues) {
    if (supersededValue !== value) {
      rotatedSessions.set(supersededValue, { value, expiresAt });
    }
  }
};
