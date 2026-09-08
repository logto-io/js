import type { SignInOptions } from '@logto/node';
import type { Session } from 'react-router';

import type { SessionRuntime } from '../infrastructure/session/index.js';

export type LogtoAuthClient = {
  signIn: (options: SignInOptions) => Promise<void>;
  handleSignInCallback: (callbackUri: string) => Promise<void>;
  signOut: (postLogoutRedirectUri?: string) => Promise<void>;
};

export type CreateLogtoAuthClient = (
  session: Session,
  navigate?: (url: string) => void
) => LogtoAuthClient;

export type LogtoAuthRequestRuntime = Readonly<{
  sessionRuntime: SessionRuntime;
  createClient: CreateLogtoAuthClient;
}>;
