import type { GetContextParameters } from '@logto/node';
import type { SessionStorage } from '@remix-run/node';

import type { CreateLogtoAdapter } from '../../infrastructure/logto/index.js';

import { GetContextController } from './GetContextController.js';
import { makeGetContextUseCase } from './GetContextUseCase.js';

type HandleGetContextDeps = {
  readonly createLogtoAdapter: CreateLogtoAdapter;
  readonly sessionStorage: SessionStorage;
};

export const makeGetContext =
  (dto: GetContextParameters, deps: HandleGetContextDeps) => async (request: Request) => {
    const { createLogtoAdapter, sessionStorage } = deps;

    const useCase = makeGetContextUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = GetContextController.fromDto({
      useCase,
      ...dto,
    });

    return controller.execute(request);
  };
