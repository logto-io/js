import nock from 'nock';

import discover from './discover';

const successResponse = {
  authorization_endpoint: 'https://logto.dev/oidc/auth',
  issuer: 'https://logto.dev/oidc',
  jwks_uri: 'https://logto.dev/oidc/jwks',
  token_endpoint: 'https://logto.dev/oidc/token',
  revocation_endpoint: 'https://logto.dev/oidc/token/revocation',
  end_session_endpoint: 'https://logto.dev/oidc/session/end',
};

describe('discover: /.well-known/openid-configuration', () => {
  test('accepts and assigns the discovered metadata', async () => {
    nock('https://logto.dev', { allowUnmocked: true })
      .get('/oidc/.well-known/openid-configuration')
      .reply(200, successResponse);

    const configuration = await discover('https://logto.dev');
    expect(configuration).toHaveProperty('authorization_endpoint', 'https://logto.dev/oidc/auth');
    expect(configuration).toHaveProperty('issuer', 'https://logto.dev/oidc');
    expect(configuration).toHaveProperty('jwks_uri', 'https://logto.dev/oidc/jwks');
    expect(configuration).toHaveProperty('token_endpoint', 'https://logto.dev/oidc/token');
    expect(configuration).toHaveProperty(
      'revocation_endpoint',
      'https://logto.dev/oidc/token/revocation'
    );
  });

  test('with ending slash', async () => {
    nock('https://logto.dev', { allowUnmocked: true })
      .get('/oidc/.well-known/openid-configuration')
      .reply(200, successResponse);

    const configuration = await discover('https://logto.dev/');
    expect(configuration).toHaveProperty('authorization_endpoint', 'https://logto.dev/oidc/auth');
    expect(configuration).toHaveProperty('issuer', 'https://logto.dev/oidc');
    expect(configuration).toHaveProperty('jwks_uri', 'https://logto.dev/oidc/jwks');
    expect(configuration).toHaveProperty('token_endpoint', 'https://logto.dev/oidc/token');
    expect(configuration).toHaveProperty(
      'revocation_endpoint',
      'https://logto.dev/oidc/token/revocation'
    );
  });
});
