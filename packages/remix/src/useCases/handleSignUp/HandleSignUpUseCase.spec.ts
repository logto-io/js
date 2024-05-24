import { createLogtoAdapter, sessionStorage, handleSignUp } from '../../framework/mocks.js';

import { makeHandleSignUpUseCase } from './HandleSignUpUseCase.js';

describe('useCases:handleSignUp:HandleSignUpUseCase', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('can make a use case executer', async () => {
    const execute = makeHandleSignUpUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    await execute({
      cookieHeader: 'abcd',
      redirectUri: '/',
    });

    expect(handleSignUp).toBeCalledTimes(1);
  });
});
