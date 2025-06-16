import type { SessionStorage } from 'react-router';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

import { HandleSignUpController } from './HandleSignUpController.js';
import { makeHandleSignUpUseCase } from './HandleSignUpUseCase.js';

type HandleSignUpDto = {
  readonly redirectBackTo: string;
};

type HandleSignUpDeps = {
  readonly createLogtoAdapter: CreateLogtoAdapter;
  readonly sessionStorage: SessionStorage;
};

export const makeHandleSignUp =
  (dto: HandleSignUpDto, deps: HandleSignUpDeps) => async (request: Request) => {
    const { createLogtoAdapter, sessionStorage } = deps;

    const useCase = makeHandleSignUpUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignUpController.fromDto({
      useCase,
      redirectUri: dto.redirectBackTo,
    });

    return controller.execute(request);
  };
