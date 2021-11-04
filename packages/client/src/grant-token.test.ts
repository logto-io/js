import nock from 'nock';

import { grantTokenByAuthorizationCode, grantTokenByRefreshToken } from './grant-token';

describe('grantTokenByAuthorizationCode', () => {
  test('get tokenSet parameters', async () => {
    const successResponse = {
      access_token: 'access_token',
      expires_in: 3600,
      id_token: 'id_token',
      refresh_token: 'refresh_token',
    };

    nock('https://logto.dev', { allowUnmocked: true })
      .post('/oidc/token')
      .reply(200, successResponse);

    const tokenSet = await grantTokenByAuthorizationCode({
      endpoint: 'https://logto.dev/oidc/token',
      code: 'code',
      redirectUri: 'http://localhost:3000/callback',
      codeVerifier: 'verifier',
      clientId: 'foo',
    });

    expect(tokenSet).toMatchObject(successResponse);
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
  test('get tokenSet paramaters', async () => {
    const successResponse = {
      access_token: 'access_token',
      expires_in: 3600,
      id_token: 'id_token',
      refresh_token: 'refresh_token',
    };

    nock('https://logto.dev', { allowUnmocked: true })
      .post('/oidc/token')
      .reply(200, successResponse);

    const tokenSet = await grantTokenByRefreshToken(
      'https://logto.dev/oidc/token',
      'client_id',
      'refresh_token'
    );

    expect(tokenSet).toMatchObject(successResponse);
  });
});
