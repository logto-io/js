import { createLogtoAdapter, sessionStorage } from '../../framework/mocks.js';

import { HandleSignUpController } from './HandleSignUpController.js';
import { makeHandleSignUpUseCase } from './HandleSignUpUseCase.js';

describe('useCases:handleSignUp:HandleSignUpController', () => {
  it('can be created', () => {
    const useCase = makeHandleSignUpUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignUpController.fromDto({
      useCase,
      redirectUri: '/',
    });

    expect(controller.constructor.name).toBe('HandleSignUpController');
  });
});
