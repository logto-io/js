import { Optional } from '@silverhand/essentials';

import { ClientStorage } from './storage';

const SESSEION_MANAGER_KEY = 'LOGTO_SESSION_MANAGER';
const SESSION_EXPIRES_SECONDS = 86_400;

interface Session {
  codeVerifier: string;
  redirectUri: string;
}

export default class SessionManager {
  constructor(private readonly storage: ClientStorage) {}

  public set(session: Session) {
    this.storage.setItem(SESSEION_MANAGER_KEY, session, {
      secondsUntilExpire: SESSION_EXPIRES_SECONDS,
    });
  }

  public get(): Optional<Session> {
    return this.storage.getItem(SESSEION_MANAGER_KEY);
  }

  public clear() {
    this.storage.removeItem(SESSEION_MANAGER_KEY);
  }
}
