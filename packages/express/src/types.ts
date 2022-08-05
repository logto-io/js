import { LogtoConfig } from '@logto/node';

declare module 'http' {
  interface IncomingMessage {
    session: Record<string, string | undefined>;
  }
}

export type LogtoExpressConfig = LogtoConfig & {
  baseUrl: string;
};

export type WithLogtoConfig = {
  getAccessToken?: boolean;
};
