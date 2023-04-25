import type { SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

type SignOutRequest = {
  readonly cookieHeader: string | undefined;
  redirectUri: string;
};

type SignOutResponse = {
  cookieHeader: string;
  readonly navigateToUrl: string;
};

export const makeHandleSignOutUseCase =
  (deps: { createLogtoAdapter: CreateLogtoAdapter; sessionStorage: SessionStorage }) =>
  async (request: SignOutRequest): Promise<SignOutResponse> => {
    const { sessionStorage, createLogtoAdapter } = deps;

    const session = await sessionStorage.getSession(request.cookieHeader);

    const logto = createLogtoAdapter(session);

    const response = await logto.handleSignOut({
      redirectUri: request.redirectUri,
    });

    const cookieHeader = await sessionStorage.destroySession(session);

    return {
      cookieHeader,
      navigateToUrl: response.navigateToUrl,
    };
  };

export type HandleSignOutUseCase = ReturnType<typeof makeHandleSignOutUseCase>;
