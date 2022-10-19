import { createLogtoAdapter, sessionStorage, handleSignInCallback } from '../../framework/mocks';
import { makeHandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase';

describe('useCases:handleSignInCallback:HandleSignInCallbackUseCase', () => {
  afterEach(() => jest.resetAllMocks());

  it('can make a use case executer', async () => {
    const execute = makeHandleSignInCallbackUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    await execute({
      cookieHeader: 'abcd',
      callbackUri: '/',
    });

    expect(handleSignInCallback).toBeCalledTimes(1);
  });
});
