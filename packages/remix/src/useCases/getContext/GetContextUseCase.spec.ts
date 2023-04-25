import {
  createLogtoAdapter,
  sessionStorage,
  getContext,
  getSession,
} from '../../framework/mocks.js';

import { makeGetContextUseCase } from './GetContextUseCase.js';

describe('useCases:getContext:GetContextUseCase', () => {
  afterEach(() => jest.resetAllMocks());

  it('can make a use case executer', async () => {
    const execute = makeGetContextUseCase({
      createLogtoAdapter,
      sessionStorage,
    });

    const response = await execute({
      cookieHeader: 'abcd',
    });

    expect(getContext).toBeCalledTimes(1);
    expect(getSession).toBeCalledTimes(1);
    expect(response.context.isAuthenticated).toBe(true);
    expect(response.context.claims?.email).toBe('test@test.io');
  });
});
