import nock from 'nock';

import { grantTokenByAuthorizationCode, grantTokenByRefreshToken } from './grant-token';

describe('grantTokenByAuthorizationCode', () => {
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

    const tokenSet = await grantTokenByAuthorizationCode(
      'https://logto.dev/oidc/token',
      'code',
      'http://localhost:3000/callback',
      'verifier'
    );

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
      grantTokenByAuthorizationCode(
        'https://logto.dev/oidc/token',
        'code',
        'http://localhost:3000/callback',
        'verifier'
      )
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
