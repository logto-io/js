import { Optional } from '@silverhand/essentials';

import { SESSION_EXPIRES_MILLISECONDS, SESSION_MANAGER_KEY } from './constants';
import { ClientStorage } from './storage';

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
