import { ClientStorage } from './storage';

const SESSEION_MANAGER_KEY = 'LOGTO_SESSEION_MANAGER';

interface Session {
  codeVerifier: string;
  redirectUri: string;
}

export default class SessionManager {
  private session?: Session;

  constructor(private readonly storage: ClientStorage) {
    this.session = this.storage.getItem(SESSEION_MANAGER_KEY);
  }

  public create(session: Session) {
    this.session = session;

    this.storage.setItem(SESSEION_MANAGER_KEY, session, { secondsUntilExpire: 86_400 });
  }

  public get(): Session | undefined {
    return this.session;
  }

  public remove() {
    this.session = undefined;
    this.storage.removeItem(SESSEION_MANAGER_KEY);
  }
}
