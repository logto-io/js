import {
  CodeTokenResponse,
  fetchTokenByAuthorizationCode,
  fetchTokenByRefreshToken,
  RefreshTokenTokenResponse,
} from './fetch-token';

describe('fetch token by providing valid refresh token', () => {
  test('get token response', async () => {
    const mockedOidcResponse = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      id_token: 'id_token',
      scope: 'read register manage',
      expires_in: 3600,
    };

    const expectedTokenResponse: RefreshTokenTokenResponse = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      scopes: ['read', 'register', 'manage'],
      expiresIn: 3600,
    };

    const fetchFunction = jest.fn().mockResolvedValue(mockedOidcResponse);

    const tokenResponse = await fetchTokenByRefreshToken(
      {
        tokenEndPoint: 'https://logto.dev/oidc/token',
        refreshToken: 'refresh_token',
        clientId: 'client_id',
        resource: 'resource',
        scopes: ['read', 'register', 'manage'],
      },
      fetchFunction // Always passing `fetchFunction` since Jest has no `fetch()`
    );

    expect(tokenResponse).toMatchObject(expectedTokenResponse);
  });
});

describe('fetch token by providing valid authorization code', () => {
  test('get token response', async () => {
    const mockedOidcResponse = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      id_token: 'id_token',
      scope: 'read register manage',
      expires_in: 3600,
    };

    const expectedTokenResponse: CodeTokenResponse = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      scopes: ['read', 'register', 'manage'],
      expiresIn: 3600,
    };

    const requester = jest.fn().mockResolvedValue(mockedOidcResponse);

    const tokenResponse = await fetchTokenByAuthorizationCode({
      tokenEndpoint: 'https://logto.dev/oidc/token',
      code: 'authorization_code',
      codeVerifier: 'code_verifier',
      clientId: 'client_id',
      redirectUri: 'redirect_uri',
      resource: 'resource',
      requester,
    });

    expect(tokenResponse).toMatchObject(expectedTokenResponse);
  });
});
