import { fetchTokenByAuthorizationCode, fetchTokenByRefreshToken } from './fetch-token.js';
import type { CodeTokenResponse, RefreshTokenTokenResponse } from './fetch-token.js';

describe('fetch access token by providing authorization code', () => {
  test('should return tokens', async () => {
    const mockedOidcResponse = {
      access_token: 'access_token_value',
      refresh_token: 'refresh_token_value',
      id_token: 'id_token_value',
      scope: 'read register',
      expires_in: 3600,
    };
    const expectedTokenResponse: CodeTokenResponse = {
      accessToken: 'access_token_value',
      refreshToken: 'refresh_token_value',
      idToken: 'id_token_value',
      scope: 'read register',
      expiresIn: 3600,
    };

    const fetchFunction = jest.fn().mockResolvedValue(mockedOidcResponse);

    const tokenResponse = await fetchTokenByAuthorizationCode(
      {
        clientId: 'client_id_value',
        tokenEndpoint: 'https://logto.dev/oidc/token',
        redirectUri: 'https://localhost:3000/callback',
        codeVerifier: 'code_verifier_value',
        code: 'code_value',
        resource: 'resource_value',
      },
      fetchFunction
    );
    expect(tokenResponse).toEqual(expectedTokenResponse);
  });
});

describe('fetch access token by providing valid refresh token', () => {
  test('should return tokens', async () => {
    const mockedOidcResponse = {
      access_token: 'access_token_value',
      refresh_token: 'new_refresh_token_value',
      id_token: 'id_token_value',
      scope: 'read register manage',
      expires_in: 3600,
    };

    const expectedTokenResponse: RefreshTokenTokenResponse = {
      accessToken: 'access_token_value',
      refreshToken: 'new_refresh_token_value',
      idToken: 'id_token_value',
      scope: 'read register manage',
      expiresIn: 3600,
    };

    const fetchFunction = jest.fn().mockResolvedValue(mockedOidcResponse);

    const tokenResponse = await fetchTokenByRefreshToken(
      {
        clientId: 'client_id_value',
        tokenEndpoint: 'https://logto.dev/oidc/token',
        refreshToken: 'old_refresh_token_value',
        resource: 'resource_value',
        scopes: ['read', 'register', 'manage'],
      },
      fetchFunction
    );

    expect(tokenResponse).toMatchObject(expectedTokenResponse);
  });
});
