import { createLogtoAdapter, sessionStorage, handleSignInCallback } from '../../framework/mocks.js';

import { makeHandleSignInCallbackUseCase } from './HandleSignInCallbackUseCase.js';

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
