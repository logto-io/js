import type { SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

import { HandleSignOutController } from './HandleSignOutController.js';
import { makeHandleSignOutUseCase } from './HandleSignOutUseCase.js';

type HandleSignOutDto = {
  readonly redirectBackTo: string;
};

type HandleSignOutDeps = {
  readonly createLogtoAdapter: CreateLogtoAdapter;
  readonly sessionStorage: SessionStorage;
};

export const makeHandleSignOut =
  (dto: HandleSignOutDto, deps: HandleSignOutDeps) => async (request: Request) => {
    const { createLogtoAdapter, sessionStorage } = deps;

    const useCase = makeHandleSignOutUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignOutController.fromDto({
      useCase,
      redirectUri: dto.redirectBackTo,
    });

    return controller.execute(request);
  };
