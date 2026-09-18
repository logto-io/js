import type { Session, SessionData, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import {
  createProcessLocalSessionCoordinator,
  type SessionCoordinator,
} from './session-coordinator.js';
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

type CoordinatedSessionOutcome<Result, Data extends SessionData, FlashData extends SessionData> =
  | Readonly<{ status: 'completed'; value: Result }>
  | Readonly<{ status: 'session-changed'; session: Session<Data, FlashData> }>;

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
  /** Serializes operations whenever storage exposes a persistent session identifier. */
  sessionCoordinator: SessionCoordinator;
}>;

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
 * Every request serializes its own operations. When storage exposes a stable session ID,
 * operations also use the configured coordinator. Cookie-only sessions remain request-local
 * because they cannot reload state committed by another response.
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
    });
  }

  /** The current session view. Its mutations remain pending until checkpoint or finalization. */
  public readonly session: TrackedSession<Data, FlashData>;

  private currentCookieHeader: string | undefined;
  private responseCookieHeader: string | undefined;
  private lifecycle: 'active' | 'destroying' | 'destroyed' = 'active';
  private readonly activeOperations = new Set<Promise<unknown>>();
  private readonly requestCoordinator = createProcessLocalSessionCoordinator();
  private readonly requestKey = globalThis.crypto.randomUUID();

  private constructor(
    private readonly options: SessionRuntimeOptions<Data, FlashData> &
      Readonly<{
        session: Session<Data, FlashData>;
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

    const checkpoint = this.runSessionOperation(async (latestSession) => {
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

      const shouldCommit = mutationCountBeforeCommit > 0 || checkpointSession.hasPendingMutations;
      if (shouldCommit) {
        await this.commitSession(latestSession, mutationCountBeforeCommit);
      } else {
        this.session.adopt(latestSession, mutationCountBeforeCommit);
      }

      if (outcome.status === 'rejected') {
        throw outcome.error;
      }

      return outcome.value;
    });

    return this.trackOperation(checkpoint);
  }

  /**
   * Runs an operation against the latest session, then destroys it under coordination even when
   * the operation rejects. Once destruction begins, further checkpoints and destruction fail.
   * Finalization waits for the destruction and performs no commit after it succeeds.
   */
  public async destroy<Result>(
    operation: SessionOperation<Result, Data, FlashData>
  ): Promise<Result> {
    this.assertActive();
    this.lifecycle = 'destroying';

    const destruction = this.runSessionOperation(async (latestSession) => {
      this.session.applyPendingMutations(latestSession);

      const destructionSession = new TrackedSession(latestSession);
      const outcome = await settleSessionOperation(operation(destructionSession));
      const cookieHeader = await this.destroySession(latestSession, destructionSession);

      this.currentCookieHeader = getRequestCookieHeader(cookieHeader);
      this.responseCookieHeader = cookieHeader;
      this.lifecycle = 'destroyed';
      this.session.adopt(createSession<Data, FlashData>());

      if (outcome.status === 'rejected') {
        throw outcome.error;
      }

      return outcome.value;
    });

    return this.trackOperation(this.recoverFailedDestruction(destruction));
  }

  /** Commits remaining mutations once and returns the latest response `Set-Cookie` header. */
  public async finalize() {
    await Promise.allSettled(this.activeOperations);

    if (this.lifecycle === 'destroyed' || !this.session.hasPendingMutations) {
      return this.responseCookieHeader;
    }

    await this.checkpoint(async () => true);

    return this.responseCookieHeader;
  }

  private assertActive() {
    if (this.lifecycle === 'destroying') {
      throw new Error('Cannot update a session while it is being destroyed.');
    }

    if (this.lifecycle === 'destroyed') {
      throw new Error('Cannot update a destroyed session.');
    }
  }

  private async destroySession(
    latestSession: Session<Data, FlashData>,
    destructionSession: TrackedSession<Data, FlashData>
  ) {
    try {
      return await this.options.sessionStorage.destroySession(latestSession);
    } catch (error: unknown) {
      this.session.appendPendingMutationsFrom(destructionSession);
      throw error;
    }
  }

  private async recoverFailedDestruction<Result>(destruction: Promise<Result>) {
    try {
      return await destruction;
    } catch (error: unknown) {
      if (this.lifecycle === 'destroying') {
        this.lifecycle = 'active';
      }

      throw error;
    }
  }

  private async commitSession(
    latestSession: Session<Data, FlashData>,
    appliedMutationCount: number
  ) {
    const cookieHeader = await this.options.sessionStorage.commitSession(latestSession);

    this.currentCookieHeader = getRequestCookieHeader(cookieHeader);
    this.responseCookieHeader = cookieHeader;
    this.session.adopt(latestSession, appliedMutationCount);

    // Session storage may assign or rotate an ID without mutating the committed session object.
    const committedSessionOutcome = await settleSessionOperation(
      this.options.sessionStorage.getSession(this.currentCookieHeader)
    );

    // Persistence and the response cookie are already committed. A failed reload must not turn a
    // successful operation into an error; the next operation will retry through the new cookie.
    if (committedSessionOutcome.status === 'fulfilled' && committedSessionOutcome.value.id) {
      this.session.adopt(committedSessionOutcome.value, 0);
    }
  }

  private async runSessionOperation<Result>(
    operation: (session: Session<Data, FlashData>) => Promise<Result>
  ) {
    return this.requestCoordinator.runExclusive(this.requestKey, async () =>
      this.runWithPersistentSessionCoordination(operation)
    );
  }

  private async runWithPersistentSessionCoordination<Result>(
    operation: (session: Session<Data, FlashData>) => Promise<Result>,
    expectedSessionId = this.session.id || undefined
  ): Promise<Result> {
    const { sessionCoordinator, sessionStorage } = this.options;

    if (!expectedSessionId) {
      const latestSession = await sessionStorage.getSession(this.currentCookieHeader);

      if (!latestSession.id) {
        return operation(latestSession);
      }

      return this.runWithPersistentSessionCoordination(operation, latestSession.id);
    }

    const outcome: CoordinatedSessionOutcome<Result, Data, FlashData> =
      await sessionCoordinator.runExclusive(expectedSessionId, async () => {
        const latestSession = await sessionStorage.getSession(this.currentCookieHeader);

        if (latestSession.id !== expectedSessionId) {
          return { status: 'session-changed', session: latestSession } as const;
        }

        return { status: 'completed', value: await operation(latestSession) } as const;
      });

    if (outcome.status === 'session-changed') {
      if (!outcome.session.id) {
        return operation(outcome.session);
      }

      return this.runWithPersistentSessionCoordination(operation, outcome.session.id);
    }

    return outcome.value;
  }

  private async trackOperation<Result>(operation: Promise<Result>) {
    this.activeOperations.add(operation);

    try {
      return await operation;
    } finally {
      this.activeOperations.delete(operation);
    }
  }
}
