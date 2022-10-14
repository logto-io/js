import type { LogtoConfig } from '@logto/node';
import { Session } from '@remix-run/node';

import { makeLogtoClient } from './create-client';
import { createStorage } from './create-storage';
import { makeGetContext } from './get-context';
import { makeHandleSignIn } from './handle-sign-in';
import { makeHandleSignInCallback } from './handle-sign-in-callback';
import { makeHandleSignOut } from './handle-sign-out';

type MakeLogtoAdapterConfiguration = LogtoConfig;

export const makeLogtoAdapter = (config: MakeLogtoAdapterConfiguration) => (session: Session) => {
  const storage = createStorage(session);
  const createClient = makeLogtoClient(config, storage);

  return {
    handleSignIn: makeHandleSignIn({ storage, createClient }),
    handleSignInCallback: makeHandleSignInCallback({ storage, createClient }),
    handleSignOut: makeHandleSignOut({ createClient }),
    getContext: makeGetContext({ storage, createClient }),
  };
};

export type CreateLogtoAdapter = ReturnType<typeof makeLogtoAdapter>;

export { type LogtoContext } from '@logto/node';
