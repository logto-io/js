import { IdTokenClaims, LogtoConfig } from '@logto/node';
import { IronSession } from 'iron-session';
import { NextApiRequest } from 'next';

export type NextRequestWithIronSession = NextApiRequest & { session: IronSession };

declare module 'iron-session' {
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

export type LogtoUser = {
  isAuthenticated: boolean;
  claims?: IdTokenClaims;
};

export type NextApiRequestWithLogtoUser = NextApiRequest & {
  user: LogtoUser;
};
