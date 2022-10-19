import { createLogtoAdapter, sessionStorage, handleSignIn } from '../../framework/mocks';
import { makeHandleSignInUseCase } from './HandleSignInUseCase';

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
