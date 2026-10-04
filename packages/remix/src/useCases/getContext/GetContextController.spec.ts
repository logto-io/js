import { createLogtoAdapter, sessionStorage } from '../../framework/mocks.js';

import { GetContextController } from './GetContextController.js';
import { makeGetContextUseCase } from './GetContextUseCase.js';

describe('useCases:getContext:GetContextController', () => {
  it('can be created', () => {
    const useCase = makeGetContextUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = GetContextController.fromDto({
      useCase,
    });

    expect(controller.constructor.name).toBe('GetContextController');
  });
});
