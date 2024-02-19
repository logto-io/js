import type { LogtoConfig } from '@logto/node';
import type NodeClient from '@logto/node';

export type LogtoNextConfig = LogtoConfig & {
  cookieSecret: string;
  cookieSecure: boolean;
  baseUrl: string;
};

export type Adapters = {
  NodeClient: typeof NodeClient;
};
