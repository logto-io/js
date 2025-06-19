import type { SessionStorage } from 'react-router';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

import { HandleSignInController } from './HandleSignInController.js';
import { makeHandleSignInUseCase } from './HandleSignInUseCase.js';

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
