import { Optional } from '@silverhand/essentials';

import { ClientStorage } from './storage';

const SESSION_MANAGER_KEY = 'LOGTO_SESSION_MANAGER';
const SESSION_EXPIRES_MILLISECONDS = 86_400_000;

interface Session {
  codeVerifier: string;
  redirectUri: string;
}

export default class SessionManager {
  constructor(private readonly storage: ClientStorage) {}

  public set(session: Session) {
    this.storage.setItem(SESSION_MANAGER_KEY, session, {
      millisecondsUntilExpire: SESSION_EXPIRES_MILLISECONDS,
    });
  }

  public get(): Optional<Session> {
    return this.storage.getItem(SESSION_MANAGER_KEY);
  }

  public clear() {
    this.storage.removeItem(SESSION_MANAGER_KEY);
  }
}
