import type { Session, SessionData, SessionStorage } from 'react-router';
import { createSession } from 'react-router';

import type { SessionCoordinator } from './session-coordinator.js';
import { TrackedSession } from './tracked-session.js';

export type SessionOperation<
  Result,
  Data extends SessionData = SessionData,
  FlashData extends SessionData = Data,
> = (session: TrackedSession<Data, FlashData>) => Promise<Result>;

export type SessionRuntimeOptions<
  Data extends SessionData = SessionData,
  FlashData extends SessionData = Data,
> = Readonly<{
  cookieHeader: string | undefined;
  sessionStorage: SessionStorage<Data, FlashData>;
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
 * Cross-request coordination requires storage that returns a stable session ID. Cookie-only
 * sessions receive request-local keys because their state cannot be reloaded after another
 * response commits it.
 */
export class SessionRuntime<
  Data extends SessionData = SessionData,
  FlashData extends SessionData = Data,
> {
  public static readonly create = async <
    Data extends SessionData = SessionData,
    FlashData extends SessionData = Data,
  >(
    options: SessionRuntimeOptions<Data, FlashData>
  ) => {
    const session = await options.sessionStorage.getSession(options.cookieHeader);

    return new SessionRuntime({
      ...options,
      session,
      sessionKey: createSessionKey(session),
    });
  };

  public readonly session: TrackedSession<Data, FlashData>;

  private currentCookieHeader: string | undefined;
  private responseCookieHeader: string | undefined;
  private destroyed = false;

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

  public readonly getResponseCookieHeader = () => this.responseCookieHeader;

  public readonly checkpoint = async <Result>(
    operation: SessionOperation<Result, Data, FlashData>
  ): Promise<Result> => {
    this.assertActive();

    const { sessionCoordinator, sessionStorage, sessionKey } = this.options;

    return sessionCoordinator.runExclusive(sessionKey, async () => {
      const latestSession = await sessionStorage.getSession(this.currentCookieHeader);
      const replayedMutationCount = this.session.pendingMutationCount;

      this.session.applyPendingMutations(latestSession, 0, replayedMutationCount);

      const checkpointSession = new TrackedSession(latestSession);
      const result = await operation(checkpointSession);
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

      return result;
    });
  };

  public readonly destroy = async <Result>(
    operation: SessionOperation<Result, Data, FlashData>
  ): Promise<Result> => {
    this.assertActive();

    const { sessionCoordinator, sessionStorage, sessionKey } = this.options;

    return sessionCoordinator.runExclusive(sessionKey, async () => {
      const latestSession = await sessionStorage.getSession(this.currentCookieHeader);

      this.session.applyPendingMutations(latestSession);

      const result = await operation(new TrackedSession(latestSession));
      const cookieHeader = await sessionStorage.destroySession(latestSession);

      this.currentCookieHeader = getRequestCookieHeader(cookieHeader);
      this.responseCookieHeader = cookieHeader;
      this.destroyed = true;
      this.session.adopt(createSession<Data, FlashData>());

      return result;
    });
  };

  public readonly finalize = async () => {
    if (this.destroyed || !this.session.hasPendingMutations) {
      return this.responseCookieHeader;
    }

    await this.checkpoint(async () => true);

    return this.responseCookieHeader;
  };

  private readonly assertActive = () => {
    if (this.destroyed) {
      throw new Error('Cannot update a destroyed session.');
    }
  };
}
