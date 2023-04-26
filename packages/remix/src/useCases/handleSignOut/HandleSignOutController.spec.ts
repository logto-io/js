import { createLogtoAdapter, sessionStorage } from '../../framework/mocks.js';

import { HandleSignOutController } from './HandleSignOutController.js';
import { makeHandleSignOutUseCase } from './HandleSignOutUseCase.js';

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
