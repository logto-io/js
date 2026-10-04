import type { Session } from '@remix-run/node';

import type { CreateLogtoClient } from './create-client.js';
import type { LogtoStorage } from './create-storage.js';

type HandleSignInCallbackRequest = {
  callbackUri: string;
};

type HandleSignInCallbackResponse = {
  readonly session: Session;
};

export const makeHandleSignInCallback =
  (deps: { storage: LogtoStorage; createClient: CreateLogtoClient }) =>
  async (request: HandleSignInCallbackRequest): Promise<HandleSignInCallbackResponse> => {
    const { storage, createClient } = deps;

    const client = createClient();

    await client.handleSignInCallback(request.callbackUri);

    return {
      session: storage.session,
    };
  };
