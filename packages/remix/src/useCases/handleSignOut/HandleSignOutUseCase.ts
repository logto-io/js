import type { SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

type SignOutRequest = {
  readonly cookieHeader: string | undefined;
  redirectUri: string;
};

type SignOutResponse =
  | Readonly<{
      status: 'fulfilled';
      cookieHeader: string;
      navigateToUrl: string;
    }>
  | Readonly<{
      status: 'rejected';
      cookieHeader: string;
      error: unknown;
    }>;

export const makeHandleSignOutUseCase =
  (deps: { createLogtoAdapter: CreateLogtoAdapter; sessionStorage: SessionStorage }) =>
  async (request: SignOutRequest): Promise<SignOutResponse> => {
    const { sessionStorage, createLogtoAdapter } = deps;

    const session = await sessionStorage.getSession(request.cookieHeader);

    const logto = createLogtoAdapter(session);

    const outcome = await logto
      .handleSignOut({
        redirectUri: request.redirectUri,
      })
      .then(
        (response) => ({ status: 'fulfilled', response }) as const,
        (error: unknown) => ({ status: 'rejected', error }) as const
      );

    const cookieHeader = await sessionStorage.destroySession(session);

    if (outcome.status === 'rejected') {
      return { status: outcome.status, cookieHeader, error: outcome.error };
    }

    return {
      status: outcome.status,
      cookieHeader,
      navigateToUrl: outcome.response.navigateToUrl,
    };
  };

export type HandleSignOutUseCase = ReturnType<typeof makeHandleSignOutUseCase>;
