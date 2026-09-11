import {
  createLogtoAdapter,
  destroySession,
  sessionStorage,
  handleSignOut,
} from '../../framework/mocks.js';

import { makeHandleSignOutUseCase } from './HandleSignOutUseCase.js';

describe('useCases:handleSignOut:makeHandleSignOutUseCase', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('can make a use case executer', async () => {
    const execute = makeHandleSignOutUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    await expect(
      execute({
        cookieHeader: 'abcd',
        redirectUri: '/',
      })
    ).resolves.toEqual({
      status: 'fulfilled',
      cookieHeader: 'logto-session=; Max-Age=0',
      navigateToUrl: '/success-handle-sign-out',
    });

    expect(handleSignOut).toBeCalledTimes(1);
    expect(destroySession).toBeCalledTimes(1);
  });

  it('destroys the session when Logto sign-out fails', async () => {
    const execute = makeHandleSignOutUseCase({
      createLogtoAdapter,
      sessionStorage,
    });
    const signOutError = new Error('OIDC discovery failed');
    handleSignOut.mockRejectedValueOnce(signOutError);

    await expect(
      execute({
        cookieHeader: 'abcd',
        redirectUri: '/',
      })
    ).resolves.toEqual({
      status: 'rejected',
      cookieHeader: 'logto-session=; Max-Age=0',
      error: signOutError,
    });

    expect(handleSignOut).toBeCalledTimes(1);
    expect(destroySession).toBeCalledTimes(1);
  });
});
