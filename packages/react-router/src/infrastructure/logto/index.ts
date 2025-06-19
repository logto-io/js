import type { LogtoConfig } from '@logto/node';
import type { Session } from 'react-router';

import { makeLogtoClient } from './create-client.js';
import { createStorage } from './create-storage.js';
import { makeGetContext } from './get-context.js';
import { makeHandleSignInCallback } from './handle-sign-in-callback.js';
import { makeHandleSignIn } from './handle-sign-in.js';
import { makeHandleSignOut } from './handle-sign-out.js';
import { makeHandleSignUp } from './handle-sign-up.js';

type MakeLogtoAdapterConfiguration = LogtoConfig;

export const makeLogtoAdapter = (config: MakeLogtoAdapterConfiguration) => (session: Session) => {
  const storage = createStorage(session);
  const createClient = makeLogtoClient(config, storage);

  return {
    handleSignIn: makeHandleSignIn({ storage, createClient }),
    handleSignInCallback: makeHandleSignInCallback({ storage, createClient }),
    handleSignOut: makeHandleSignOut({ createClient }),
    handleSignUp: makeHandleSignUp({ storage, createClient }),
    getContext: makeGetContext({ storage, createClient }),
  };
};

export type CreateLogtoAdapter = ReturnType<typeof makeLogtoAdapter>;

export { type LogtoContext } from '@logto/node';
