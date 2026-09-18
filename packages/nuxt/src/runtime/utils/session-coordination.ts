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
 * A session has no stable identifier of its own: every refresh mints a new cookie value. The
 * registry therefore tracks every cookie value a session has been known by and maps each of them
 * to one canonical key, the first value the session was seen with. Requests lock on that key, so
 * a request still carrying an old cookie and a request already carrying the rotated one queue
 * behind each other instead of refreshing the same session in parallel.
 *
 * Coordination is limited to the current JavaScript process. Multi-instance deployments need
 * shared server-side session storage with a distributed lock; cookie-only sessions cannot be
 * coordinated across instances.
 */

type SessionAlias = {
  /** The canonical key of the session this cookie value belongs to. */
  canonical: string;
  expiresAt: number;
};

type LatestSession = {
  /** The latest wrapped session cookie value minted for the session. */
  value: string;
  expiresAt: number;
};

/**
 * How long a rotated session is remembered for requests that were already in flight with a
 * previous cookie. The window only has to cover the round trip of the response that delivered
 * the new cookie.
 */
const rotatedSessionTtlMs = 30_000;

const sessionLocks = new Map<string, Promise<void>>();
const sessionAliases = new Map<string, SessionAlias>();
const latestSessions = new Map<string, LatestSession>();

/**
 * Drops every rotation record whose window has closed. Called on each write so the registry stays
 * bounded by the number of rotations within one window rather than by the process lifetime:
 * a superseded cookie is normally never looked up again, so expiry cannot rely on reads.
 */
const evictExpiredSessions = (now: number): void => {
  for (const [key, alias] of sessionAliases) {
    if (alias.expiresAt <= now) {
      sessionAliases.delete(key);
    }
  }

  for (const [key, latest] of latestSessions) {
    if (latest.expiresAt <= now) {
      latestSessions.delete(key);
    }
  }
};

const resolveCanonicalKey = (sessionValue: string, now: number): string => {
  const alias = sessionAliases.get(sessionValue);

  if (!alias || alias.expiresAt <= now) {
    return sessionValue;
  }

  return alias.canonical;
};

/**
 * Returns the freshest session value minted for the session `sessionValue` belongs to, or
 * `undefined` when no in-flight rotation is known.
 */
export const getRotatedSessionValue = (sessionValue: string): string | undefined => {
  const now = Date.now();
  const latest = latestSessions.get(resolveCanonicalKey(sessionValue, now));

  if (!latest || latest.expiresAt <= now || latest.value === sessionValue) {
    return undefined;
  }

  return latest.value;
};

/**
 * Runs `operation` exclusively from other operations on the same session, whichever cookie value
 * of that session the caller holds. A rejected operation does not poison the queue for the next
 * caller.
 */
export const runSessionExclusive = async <Result>(
  sessionValue: string,
  operation: () => Promise<Result>
): Promise<Result> => {
  const sessionKey = resolveCanonicalKey(sessionValue, Date.now());
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
 * Remembers the session value minted by a request so concurrent requests that still carry an
 * older cookie can adopt it, and so requests that already carry the new cookie lock on the same
 * session. Must be called while the caller still holds the session lock, before the response
 * delivers the new cookie to the browser.
 */
export const recordRotatedSessionValue = (sessionValue: string, value: string): void => {
  const now = Date.now();
  evictExpiredSessions(now);

  const canonical = resolveCanonicalKey(sessionValue, now);
  const expiresAt = now + rotatedSessionTtlMs;

  sessionAliases.set(sessionValue, { canonical, expiresAt });
  sessionAliases.set(value, { canonical, expiresAt });
  latestSessions.set(canonical, { value, expiresAt });
};

/** Forgets every rotation record. Intended for tests. */
export const clearSessionCoordination = (): void => {
  sessionLocks.clear();
  sessionAliases.clear();
  latestSessions.clear();
};

/** The number of rotation records currently retained. Intended for tests. */
export const getRotatedSessionCount = (): number => sessionAliases.size + latestSessions.size;
