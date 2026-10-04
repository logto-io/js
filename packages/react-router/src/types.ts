import type { LogtoConfig } from '@logto/node';

export type LogtoReactRouterConfig = Readonly<LogtoConfig> & {
  readonly baseUrl: string;
};
