import { Session } from '@remix-run/node';

import { CreateLogtoClient } from './create-client';
import { LogtoStorage } from './create-storage';

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
