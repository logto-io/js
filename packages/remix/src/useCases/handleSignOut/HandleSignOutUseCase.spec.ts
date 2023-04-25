import { createLogtoAdapter, sessionStorage, handleSignOut } from '../../framework/mocks.js';

import { makeHandleSignOutUseCase } from './HandleSignOutUseCase.js';

describe('useCases:handleSignOut:makeHandleSignOutUseCase', () => {
  afterEach(() => jest.resetAllMocks());

  it('can make a use case executer', async () => {
    const execute = makeHandleSignOutUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    await execute({
      cookieHeader: 'abcd',
      redirectUri: '/',
    });

    expect(handleSignOut).toBeCalledTimes(1);
  });
});
