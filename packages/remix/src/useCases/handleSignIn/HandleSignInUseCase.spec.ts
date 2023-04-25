import { createLogtoAdapter, sessionStorage, handleSignIn } from '../../framework/mocks.js';

import { makeHandleSignInUseCase } from './HandleSignInUseCase.js';

describe('useCases:handleSignIn:HandleSignInUseCase', () => {
  afterEach(() => jest.resetAllMocks());

  it('can make a use case executer', async () => {
    const execute = makeHandleSignInUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    await execute({
      cookieHeader: 'abcd',
      redirectUri: '/',
    });

    expect(handleSignIn).toBeCalledTimes(1);
  });
});
