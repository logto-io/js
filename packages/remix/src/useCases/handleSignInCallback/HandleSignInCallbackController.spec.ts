import { createLogtoAdapter, sessionStorage } from '../../framework/mocks.js';

import { HandleSignInCallbackController } from './HandleSignInCallbackController.js';
import { makeHandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase.js';

describe('useCases:handleSignInCallback:HandleSignInCallbackController', () => {
  it('can be created', () => {
    const useCase = makeHandleSignInCallbackUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignInCallbackController.fromDto({
      useCase,
      redirectUri: '/',
    });

    expect(controller.constructor.name).toBe('HandleSignInCallbackController');
  });
});
