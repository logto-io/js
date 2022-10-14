import { LogtoContext } from '@logto/node';

import { CreateLogtoClient } from './create-client';
import { LogtoStorage } from './create-storage';

type GetContextRequest = {
  readonly includeAccessToken: boolean;
};

type GetContextResponse = {
  readonly context: LogtoContext;
};

export const makeGetContext =
  (deps: { storage: LogtoStorage; createClient: CreateLogtoClient }) =>
  async (request: GetContextRequest): Promise<GetContextResponse> => {
    const { storage, createClient } = deps;

    const client = createClient();

    const context = await client.getContext(request.includeAccessToken);

    return {
      context,
    };
  };
