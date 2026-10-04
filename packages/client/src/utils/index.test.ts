import { buildAccessTokenKey, getDiscoveryEndpoint } from './index.js';

describe('client utilities', () => {
  test('get discovery endpoint', () => {
    const endpoint = getDiscoveryEndpoint('https://example.com');
    expect(endpoint).toEqual('https://example.com/oidc/.well-known/openid-configuration');
  });

  test('get discovery endpoint with tenant path', () => {
    const endpoint = getDiscoveryEndpoint('https://cloud.logto.io/tenantId');
    expect(endpoint).toEqual(
      'https://cloud.logto.io/tenantId/oidc/.well-known/openid-configuration'
    );
  });

  test('build access token key for resource', () => {
    const key = buildAccessTokenKey('resource', undefined, ['scope1', 'scope2']);
    expect(key).toEqual('scope1 scope2@resource');
  });

  test('build access token key for organization', () => {
    const key = buildAccessTokenKey('resource', 'organization', ['scope1', 'scope2']);
    expect(key).toEqual('scope1 scope2@resource#organization');

    const key2 = buildAccessTokenKey(undefined, 'organization');
    expect(key2).toEqual('@#organization');
  });
});
