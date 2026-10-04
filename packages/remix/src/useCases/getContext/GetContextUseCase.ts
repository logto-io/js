import type { GetContextParameters } from '@logto/node';
import type { SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter, LogtoContext } from '../../infrastructure/logto/index.js';

type GetContextRequest = GetContextParameters & {
  readonly cookieHeader: string | undefined;
};

type GetContextResponse = {
  context: Readonly<LogtoContext>;
};

export const makeGetContextUseCase =
  (deps: { createLogtoAdapter: CreateLogtoAdapter; sessionStorage: SessionStorage }) =>
  async (request: GetContextRequest): Promise<GetContextResponse> => {
    const { sessionStorage, createLogtoAdapter } = deps;

    const session = await sessionStorage.getSession(request.cookieHeader);

    const logto = createLogtoAdapter(session);

    const response = await logto.getContext(request);

    return {
      context: response.context,
    };
  };

export type GetContextUseCase = ReturnType<typeof makeGetContextUseCase>;
