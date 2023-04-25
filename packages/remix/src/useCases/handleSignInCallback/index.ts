import type { SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

import { HandleSignInCallbackController } from './HandleSignInCallbackController.js';
import { makeHandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase.js';

type HandleSignInCallbackDto = {
  readonly redirectBackTo: string;
};

type HandleSignInCallbackDeps = {
  readonly createLogtoAdapter: CreateLogtoAdapter;
  readonly sessionStorage: SessionStorage;
};

export const makeHandleSignInCallback =
  (dto: HandleSignInCallbackDto, deps: HandleSignInCallbackDeps) => async (request: Request) => {
    const { createLogtoAdapter, sessionStorage } = deps;

    const useCase = makeHandleSignInCallbackUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignInCallbackController.fromDto({
      useCase,
      redirectUri: dto.redirectBackTo,
    });

    return controller.execute(request);
  };
