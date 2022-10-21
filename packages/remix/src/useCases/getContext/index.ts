import { GetContextParameters } from '@logto/node';
import { SessionStorage } from '@remix-run/node';

import { CreateLogtoAdapter } from '../../infrastructure/logto';
import { GetContextController } from './GetContextController';
import { makeGetContextUseCase } from './GetContextUseCase';

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
