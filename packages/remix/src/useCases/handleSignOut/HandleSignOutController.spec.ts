import { createLogtoAdapter, sessionStorage } from '../../framework/mocks.js';

import { HandleSignOutController } from './HandleSignOutController.js';
import { makeHandleSignOutUseCase } from './HandleSignOutUseCase.js';

describe('useCases:handleSignOut:HandleSignOutController', () => {
  it('can be created', () => {
    const useCase = makeHandleSignOutUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const controller = HandleSignOutController.fromDto({
      useCase,
      redirectUri: '/',
    });

    expect(controller.constructor.name).toBe('HandleSignOutController');
  });

  it('throws an error response with the destroyed session cookie when sign-out fails', async () => {
    const useCase = vi.fn(async () => ({
      status: 'rejected' as const,
      cookieHeader: 'logto-session=; Max-Age=0',
    }));
    const controller = HandleSignOutController.fromDto({
      useCase,
      redirectUri: '/',
    });
    const request = new Request('https://app.example.com/sign-out', {
      headers: { Cookie: 'logto-session=session-id' },
    });

    try {
      await controller.execute(request);
      expect.fail('Expected sign-out to throw an error response.');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Response);

      if (error instanceof Response) {
        expect(error.status).toBe(500);
        expect(error.headers.get('Set-Cookie')).toBe('logto-session=; Max-Age=0');
      }
    }
  });
});
