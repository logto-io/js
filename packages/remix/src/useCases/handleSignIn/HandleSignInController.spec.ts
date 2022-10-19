import { createLogtoAdapter, sessionStorage } from '../../framework/mocks';
import { HandleSignInController } from './HandleSignInController';
import { makeHandleSignInUseCase } from './HandleSignInUseCase';

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
