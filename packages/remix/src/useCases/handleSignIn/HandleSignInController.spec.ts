import { createLogtoAdapter, sessionStorage } from '../../framework/mocks.js';

import { HandleSignInController } from './HandleSignInController.js';
import { makeHandleSignInUseCase } from './HandleSignInUseCase.js';

describe('useCases:handleSignIn:HandleSignInController', () => {
  it('can be created', () => {
    const useCase = makeHandleSignInUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignInController.fromDto({
      useCase,
      redirectUri: '/',
    });

    expect(controller.constructor.name).toBe('HandleSignInController');
  });
});
