import type { SessionStorage } from 'react-router';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

type SignUpRequest = {
  readonly cookieHeader: string | undefined;
  readonly redirectUri: string;
};

type SignUpResponse = {
  readonly cookieHeader: string;
  readonly navigateToUrl: string;
};

export const makeHandleSignUpUseCase =
  (deps: { createLogtoAdapter: CreateLogtoAdapter; sessionStorage: SessionStorage }) =>
  async (request: SignUpRequest): Promise<SignUpResponse> => {
    const { sessionStorage, createLogtoAdapter } = deps;

    const session = await sessionStorage.getSession(request.cookieHeader);

    const logto = createLogtoAdapter(session);

    const response = await logto.handleSignUp({
      redirectUri: request.redirectUri,
    });

    const cookieHeader = await sessionStorage.commitSession(response.session);

    return {
      cookieHeader,
      navigateToUrl: response.navigateToUrl,
    };
  };

export type HandleSignUpUseCase = ReturnType<typeof makeHandleSignUpUseCase>;
