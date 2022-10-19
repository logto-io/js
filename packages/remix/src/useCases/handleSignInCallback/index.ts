import { SessionStorage } from '@remix-run/node';

import { CreateLogtoAdapter } from '../../infrastructure/logto';
import { HandleSignInCallbackController } from './HandleSignInCallbackController';
import { makeHandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase';

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
