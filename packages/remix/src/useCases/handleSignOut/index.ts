import { SessionStorage } from '@remix-run/node';

import { CreateLogtoAdapter } from '../../infrastructure/logto';
import { HandleSignOutController } from './HandleSignOutController';
import { makeHandleSignOutUseCase } from './HandleSignOutUseCase';

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
