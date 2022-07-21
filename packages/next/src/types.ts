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

declare module 'http' {
  interface IncomingMessage {
    user: LogtoUser;
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
  accessToken?: string;
};

/**
 * @getAccessToken: if set to true, will try to get an access token and attach to req.user,
 * if unable to grant an access token, will set req.user.isAuthenticated to false,
 * this can make sure the refresh token is not revoked and still valid, so is considered more secure.
 */
export type WithLogtoConfig = {
  getAccessToken?: boolean;
};
