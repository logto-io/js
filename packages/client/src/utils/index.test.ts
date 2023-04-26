import { buildAccessTokenKey, getDiscoveryEndpoint } from './index.js';

describe('client utilities', () => {
  test('get discovery endpoint', () => {
    const endpoint = getDiscoveryEndpoint('https://example.com');
    expect(endpoint).toEqual('https://example.com/oidc/.well-known/openid-configuration');
  });

  test('build access token key', () => {
    const key = buildAccessTokenKey('resource', ['scope1', 'scope2']);
    expect(key).toEqual('scope1 scope2@resource');
  });
});
