import { createLogtoAdapter, sessionStorage } from '../../framework/mocks';
import { HandleSignInCallbackController } from './HandleSignInCallbackController';
import { makeHandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase';

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
