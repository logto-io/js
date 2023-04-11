import type { LogtoConfig } from '@logto/node';
import type { IronSession } from 'iron-session';
import type { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';
import type { NextApiRequest } from 'next';

export type NextRequestWithIronSession = NextApiRequest & { session: IronSession };

declare module 'iron-session' {
  // Honor module definition
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface IronSessionData {
    accessToken?: string;
    idToken?: string;
    signInSession?: string;
    refreshToken?: string;
  }
}

export type LogtoNextConfig = LogtoConfig & {
  cookieSecret: string;
  cookieSecure: boolean;
  baseUrl: string;
};

export type Adapters = {
  withIronSessionApiRoute: typeof withIronSessionApiRoute;
  withIronSessionSsr: typeof withIronSessionSsr;
};
