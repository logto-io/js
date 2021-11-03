import { getLoginUrlAndCodeVerifier } from './request-login';

test('getLoginUrlAndCodeVerifier', async () => {
  const { url } = await getLoginUrlAndCodeVerifier({
    baseUrl: 'http://logto.dev/oidc/auth',
    clientId: 'foo',
    scope: 'openid offline_access',
    redirectUri: 'http://localhost:3000',
  });
  expect(url).toContain('code_challenge_method=S256');
});
