import { createLogtoAdapter, sessionStorage } from '../../framework/mocks';
import { HandleSignOutController } from './HandleSignOutController';
import { makeHandleSignOutUseCase } from './HandleSignOutUseCase';

describe('useCases:handleSignOut:HandleSignOutController', () => {
  it('can be created', () => {
    const useCase = makeHandleSignOutUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignOutController.fromDto({
      useCase,
      redirectUri: '/',
    });

    expect(controller.constructor.name).toBe('HandleSignOutController');
  });
});
