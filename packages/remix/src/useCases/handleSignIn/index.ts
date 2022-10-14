import { SessionStorage } from '@remix-run/node';

import { CreateLogtoAdapter } from '../../infrastructure/logto';
import { HandleSignInController } from './HandleSignInController';
import { makeHandleSignInUseCase } from './HandleSignInUseCase';

type HandleSignInDto = {
  readonly redirectBackTo: string;
};

type HandleSignInDeps = {
  readonly createLogtoAdapter: CreateLogtoAdapter;
  readonly sessionStorage: SessionStorage;
};

export const makeHandleSignIn =
  (dto: HandleSignInDto, deps: HandleSignInDeps) => async (request: Request) => {
    const { createLogtoAdapter, sessionStorage } = deps;

    const useCase = makeHandleSignInUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignInController.fromDto({
      useCase,
      redirectUri: dto.redirectBackTo,
    });

    return controller.execute(request);
  };
