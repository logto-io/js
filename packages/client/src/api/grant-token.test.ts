import nock from 'nock';

import { LogtoError } from '../modules/errors';
import { grantTokenByAuthorizationCode, grantTokenByRefreshToken } from './grant-token';

describe('grantTokenByAuthorizationCode', () => {
  test('get token response', async () => {
    const successResponse = {
      access_token: 'access_token',
      expires_in: 3600,
      id_token: 'id_token',
      refresh_token: 'refresh_token',
    };

    nock('https://logto.dev', { allowUnmocked: true })
      .post('/oidc/token')
      .reply(200, successResponse);

    const tokenResponse = await grantTokenByAuthorizationCode({
      endpoint: 'https://logto.dev/oidc/token',
      code: 'code',
      redirectUri: 'http://localhost:3000/callback',
      codeVerifier: 'verifier',
      clientId: 'foo',
    });

    expect(tokenResponse).toMatchObject(successResponse);
  });

  test('lack of access_token', async () => {
    const successResponse = {
      expires_in: 3600,
      id_token: 'id_token',
      refresh_token: 'refresh_token',
    };

    nock('https://logto.dev', { allowUnmocked: true })
      .post('/oidc/token')
      .reply(200, successResponse);

    await expect(
      grantTokenByAuthorizationCode({
        endpoint: 'https://logto.dev/oidc/token',
        code: 'code',
        redirectUri: 'http://localhost:3000/callback',
        codeVerifier: 'verifier',
        clientId: 'foo',
      })
    ).rejects.toThrowError();
  });
});

describe('grantTokenByRefreshToken', () => {
  test('get token response', async () => {
    const successResponse = {
      access_token: 'access_token',
      expires_in: 3600,
      id_token: 'id_token',
      refresh_token: 'refresh_token',
    };

    nock('https://logto.dev', { allowUnmocked: true })
      .post('/oidc/token')
      .reply(200, successResponse);

    const tokenResponse = await grantTokenByRefreshToken({
      endpoint: 'https://logto.dev/oidc/token',
      clientId: 'client_id',
      refreshToken: 'refresh_token',
    });

    expect(tokenResponse).toMatchObject(successResponse);
  });

  test('should throw LogtoError instead of StructError', async () => {
    nock('https://logto.dev', { allowUnmocked: true }).post('/oidc/token').reply(200, {});

    await expect(
      grantTokenByRefreshToken({
        endpoint: 'https://logto.dev/oidc/token',
        clientId: 'client_id',
        refreshToken: 'refresh_token',
      })
    ).rejects.toThrowError(
      new LogtoError({
        message:
          'Remote response format error: At path: access_token -- Expected a string, but received: undefined',
      })
    );
  });
});
