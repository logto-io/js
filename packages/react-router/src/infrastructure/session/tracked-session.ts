import type { Session, SessionData } from 'react-router';

type SessionMutation<Data, FlashData> = (session: Session<Data, FlashData>) => void;

const applySessionMutations = <Data, FlashData>(
  session: Session<Data, FlashData>,
  mutations: ReadonlyArray<SessionMutation<Data, FlashData>>
) => {
  for (const mutation of mutations) {
    mutation(session);
  }
};

export class TrackedSession<Data = SessionData, FlashData = Data>
  implements Session<Data, FlashData>
{
  private mutations: ReadonlyArray<SessionMutation<Data, FlashData>> = [];

  public constructor(private currentSession: Session<Data, FlashData>) {}

  public get id() {
    return this.currentSession.id;
  }

  public get data() {
    return this.currentSession.data;
  }

  public get hasPendingMutations() {
    return this.mutations.length > 0;
  }

  public get pendingMutationCount() {
    return this.mutations.length;
  }

  public has(name: (keyof Data | keyof FlashData) & string) {
    return this.currentSession.has(name);
  }

  public get<Key extends (keyof Data | keyof FlashData) & string>(name: Key) {
    const dataKeysBeforeGet = Object.keys(this.currentSession.data);
    const value = this.currentSession.get(name);
    const dataKeysAfterGet = new Set(Object.keys(this.currentSession.data));
    const mutatedSession = dataKeysBeforeGet.some((key) => !dataKeysAfterGet.has(key));

    if (mutatedSession) {
      this.mutations = [
        ...this.mutations,
        (session) => {
          session.get(name);
        },
      ];
    }

    return value;
  }

  public set<Key extends keyof Data & string>(name: Key, value: Data[Key]) {
    this.currentSession.set(name, value);
    this.mutations = [
      ...this.mutations,
      (session) => {
        session.set(name, value);
      },
    ];
  }

  public flash<Key extends keyof FlashData & string>(name: Key, value: FlashData[Key]) {
    this.currentSession.flash(name, value);
    this.mutations = [
      ...this.mutations,
      (session) => {
        session.flash(name, value);
      },
    ];
  }

  public unset(name: keyof Data & string) {
    this.currentSession.unset(name);
    this.mutations = [
      ...this.mutations,
      (session) => {
        session.unset(name);
      },
    ];
  }

  public readonly applyPendingMutations = (
    session: Session<Data, FlashData>,
    startIndex = 0,
    endIndex = this.mutations.length
  ) => {
    applySessionMutations(session, this.mutations.slice(startIndex, endIndex));
  };

  public readonly adopt = (
    session: Session<Data, FlashData>,
    appliedMutationCount = this.mutations.length
  ) => {
    const remainingMutations = this.mutations.slice(appliedMutationCount);

    this.currentSession = session;
    applySessionMutations(this.currentSession, remainingMutations);
    this.mutations = remainingMutations;
  };
}
