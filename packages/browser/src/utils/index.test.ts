import { getLogtoKey, getDiscoveryEndpoint, buildAccessTokenKey } from '.';

describe('browser SDK utilities', () => {
  test('get logto key', () => {
    const key = getLogtoKey('item');
    expect(key).toEqual('logto:item');
  });

  test('get discovery endpoint', () => {
    const endpoint = getDiscoveryEndpoint('https://example.com');
    expect(endpoint).toEqual('https://example.com/oidc/.well-known/openid-configuration');
  });

  test('build access token key', () => {
    const key = buildAccessTokenKey('resource', ['scope1', 'scope2']);
    expect(key).toEqual('scope1 scope2@resource');
  });
});
