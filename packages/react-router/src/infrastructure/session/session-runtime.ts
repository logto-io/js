import type { Session, SessionData, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import type { SessionCoordinator } from './session-coordinator.js';
import { TrackedSession } from './tracked-session.js';

/**
 * Work performed against the latest coordinated session state. The provided session must not be
 * retained after the operation settles.
 */
export type SessionOperation<
  Result,
  Data extends SessionData = SessionData,
  FlashData extends SessionData = Data,
> = (session: TrackedSession<Data, FlashData>) => Promise<Result>;

type SessionOperationOutcome<Result> =
  | Readonly<{ status: 'fulfilled'; value: Result }>
  | Readonly<{ status: 'rejected'; error: unknown }>;

const settleSessionOperation = async <Result>(
  operation: Promise<Result>
): Promise<SessionOperationOutcome<Result>> => {
  try {
    return { status: 'fulfilled', value: await operation };
  } catch (error: unknown) {
    return { status: 'rejected', error };
  }
};

/** Inputs for creating a request-scoped session runtime. */
export type SessionRuntimeOptions<
  Data extends SessionData = SessionData,
  FlashData extends SessionData = Data,
> = Readonly<{
  /** The incoming request's `Cookie` header. */
  cookieHeader: string | undefined;
  /**
   * React Router session storage. Cross-request coordination requires stable session IDs;
   * multi-instance coordination also requires shared server-side storage.
   */
  sessionStorage: SessionStorage<Data, FlashData>;
  /** Serializes persistence operations that share a session identifier. */
  sessionCoordinator: SessionCoordinator;
}>;

const createSessionKey = (session: Session) => {
  if (session.id) {
    return session.id;
  }

  // Cookie-backed sessions cannot reload state committed by another response.
  return globalThis.crypto.randomUUID();
};

const getRequestCookieHeader = (setCookieHeader: string) => {
  const attributeSeparatorIndex = setCookieHeader.indexOf(';');

  if (attributeSeparatorIndex === -1) {
    return setCookieHeader;
  }

  return setCookieHeader.slice(0, attributeSeparatorIndex);
};

/**
 * Tracks one request's session mutations and coordinates persistence against the latest stored
 * state. Create one runtime per request and finalize it before producing the response.
 *
 * Cross-request coordination requires storage that returns a stable session ID. Cookie-only
 * sessions receive request-local keys because they cannot reload state committed by another
 * response.
 */
export class SessionRuntime<
  Data extends SessionData = SessionData,
  FlashData extends SessionData = Data,
> {
  /** Creates a request-scoped runtime from the incoming request cookie. */
  public static async create<
    Data extends SessionData = SessionData,
    FlashData extends SessionData = Data,
  >(options: SessionRuntimeOptions<Data, FlashData>) {
    const session = await options.sessionStorage.getSession(options.cookieHeader);

    return new SessionRuntime({
      ...options,
      session,
      sessionKey: createSessionKey(session),
    });
  }

  /** The current session view. Its mutations remain pending until checkpoint or finalization. */
  public readonly session: TrackedSession<Data, FlashData>;

  private currentCookieHeader: string | undefined;
  private responseCookieHeader: string | undefined;
  private destroyed = false;
  private readonly activeCheckpoints = new Set<Promise<unknown>>();

  private constructor(
    private readonly options: SessionRuntimeOptions<Data, FlashData> &
      Readonly<{
        session: Session<Data, FlashData>;
        sessionKey: string;
      }>
  ) {
    this.currentCookieHeader = options.cookieHeader;
    this.session = new TrackedSession(options.session);
  }

  /** Returns the latest response `Set-Cookie` header produced by this runtime. */
  public getResponseCookieHeader() {
    return this.responseCookieHeader;
  }

  /**
   * Reloads and updates the session under coordination, then persists the resulting state.
   * Mutations completed before an operation rejects are still persisted because external effects,
   * such as refresh-token rotation, cannot be rolled back.
   * Mutations recorded on {@link session} while the operation is in flight remain pending.
   */
  public async checkpoint<Result>(
    operation: SessionOperation<Result, Data, FlashData>
  ): Promise<Result> {
    this.assertActive();

    const { sessionCoordinator, sessionStorage, sessionKey } = this.options;

    const checkpoint = sessionCoordinator.runExclusive(sessionKey, async () => {
      const latestSession = await sessionStorage.getSession(this.currentCookieHeader);
      const replayedMutationCount = this.session.pendingMutationCount;

      this.session.applyPendingMutations(latestSession, 0, replayedMutationCount);

      const checkpointSession = new TrackedSession(latestSession);
      const outcome = await settleSessionOperation(operation(checkpointSession));
      const mutationCountBeforeCommit = this.session.pendingMutationCount;

      this.session.applyPendingMutations(
        latestSession,
        replayedMutationCount,
        mutationCountBeforeCommit
      );

      if (mutationCountBeforeCommit > 0 || checkpointSession.hasPendingMutations) {
        const cookieHeader = await sessionStorage.commitSession(latestSession);

        this.currentCookieHeader = getRequestCookieHeader(cookieHeader);
        this.responseCookieHeader = cookieHeader;
      }

      this.session.adopt(latestSession, mutationCountBeforeCommit);

      if (outcome.status === 'rejected') {
        throw outcome.error;
      }

      return outcome.value;
    });

    return this.trackCheckpoint(checkpoint);
  }

  /**
   * Runs an operation against the latest session, then destroys it under coordination even when
   * the operation rejects. Once destroyed, further checkpoints and destruction fail and
   * finalization performs no commit.
   */
  public async destroy<Result>(
    operation: SessionOperation<Result, Data, FlashData>
  ): Promise<Result> {
    this.assertActive();

    const { sessionCoordinator, sessionStorage, sessionKey } = this.options;

    return sessionCoordinator.runExclusive(sessionKey, async () => {
      const latestSession = await sessionStorage.getSession(this.currentCookieHeader);

      this.session.applyPendingMutations(latestSession);

      const outcome = await settleSessionOperation(operation(new TrackedSession(latestSession)));
      const cookieHeader = await sessionStorage.destroySession(latestSession);

      this.currentCookieHeader = getRequestCookieHeader(cookieHeader);
      this.responseCookieHeader = cookieHeader;
      this.destroyed = true;
      this.session.adopt(createSession<Data, FlashData>());

      if (outcome.status === 'rejected') {
        throw outcome.error;
      }

      return outcome.value;
    });
  }

  /** Commits remaining mutations once and returns the latest response `Set-Cookie` header. */
  public async finalize() {
    await Promise.allSettled(this.activeCheckpoints);

    if (this.destroyed || !this.session.hasPendingMutations) {
      return this.responseCookieHeader;
    }

    await this.checkpoint(async () => true);

    return this.responseCookieHeader;
  }

  private assertActive() {
    if (this.destroyed) {
      throw new Error('Cannot update a destroyed session.');
    }
  }

  private async trackCheckpoint<Result>(checkpoint: Promise<Result>) {
    this.activeCheckpoints.add(checkpoint);

    try {
      return await checkpoint;
    } finally {
      this.activeCheckpoints.delete(checkpoint);
    }
  }
}
