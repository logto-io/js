import { createLogtoAdapter, sessionStorage } from '../../framework/mocks';
import { GetContextController } from './GetContextController';
import { makeGetContextUseCase } from './GetContextUseCase';

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
