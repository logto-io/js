import type { Storage, StorageKey } from '@logto/node';
import type { Session } from '@remix-run/node';

class LogtoStorage implements Storage {
  public static readonly fromSession = (session: Session) => {
    return new LogtoStorage({ session });
  };

  public readonly session = this.properties.session;

  private constructor(
    private readonly properties: {
      session: Session;
    }
  ) {}

  public readonly setItem = async (key: StorageKey, value: string) => {
    this.session.set(key, value);
  };

  public readonly getItem = async (key: StorageKey) => {
    const itemExists = this.session.has(key);

    if (!itemExists) {
      return null;
    }

    return String(this.session.get(key));
  };

  public readonly removeItem = async (key: StorageKey) => {
    this.session.unset(key);
  };

  public readonly save = async () => {
    // Not required as the persistence happens in the integration layer
  };
}

export const createStorage = (session: Session) => LogtoStorage.fromSession(session);

export type { LogtoStorage };
