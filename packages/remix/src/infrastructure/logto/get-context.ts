import type { GetContextParameters, LogtoContext } from '@logto/node';

import type { CreateLogtoClient } from './create-client';
import type { LogtoStorage } from './create-storage';

type GetContextResponse = {
  readonly context: LogtoContext;
};

export const makeGetContext =
  (deps: { storage: LogtoStorage; createClient: CreateLogtoClient }) =>
  async (request: GetContextParameters): Promise<GetContextResponse> => {
    const { storage, createClient } = deps;

    const client = createClient();

    const context = await client.getContext(request);

    return {
      context,
    };
  };
