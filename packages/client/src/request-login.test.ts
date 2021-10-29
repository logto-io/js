import { getLoginUrlAndCodeVerifier } from './request-login';

test('getLoginUrlAndCodeVerifier', async () => {
  const { url } = await getLoginUrlAndCodeVerifier(
    'http://logto.dev/oidc/auth',
    'foo',
    'http://localhost:3000'
  );
  expect(url).toContain('code_challenge_method=S256');
});
