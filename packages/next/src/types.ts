import type { LogtoConfig, PersistKey } from '@logto/node';
import type NodeClient from '@logto/node';

export type SessionData = {
  [PersistKey.AccessToken]?: string;
  [PersistKey.IdToken]?: string;
  [PersistKey.SignInSession]?: string;
  [PersistKey.RefreshToken]?: string;
};

export type Session = SessionData & {
  save: () => Promise<void>;
};

export type LogtoNextConfig = LogtoConfig & {
  cookieSecret: string;
  cookieSecure: boolean;
  baseUrl: string;
};

export type Adapters = {
  NodeClient: typeof NodeClient;
};
