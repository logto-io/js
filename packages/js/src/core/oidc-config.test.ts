import { fetchOidcConfig } from './oidc-config.js';

describe('fetchOidcConfig', () => {
  test('should return OidcConfigResponse with camel case keys', async () => {
    const requester = jest.fn().mockResolvedValue({
      authorization_endpoint: 'foo',
      token_endpoint: 'foo',
      userinfo_endpoint: 'foo',
      end_session_endpoint: 'foo',
      revocation_endpoint: 'foo',
      jwks_uri: 'foo',
      issuer: 'foo',
    });
    await expect(
      fetchOidcConfig('https://example.com/oidc/.well-known/openid-configuration', requester)
    ).resolves.toEqual({
      authorizationEndpoint: 'foo',
      tokenEndpoint: 'foo',
      userinfoEndpoint: 'foo',
      endSessionEndpoint: 'foo',
      revocationEndpoint: 'foo',
      jwksUri: 'foo',
      issuer: 'foo',
    });
  });
});
