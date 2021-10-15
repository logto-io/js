import { getLoginUrlAndCodeVerifier } from './request-login';

test('getLoginUrlAndCodeVerifier', () => {
  const { url } = getLoginUrlAndCodeVerifier(
    'http://logto.dev/oidc/auth',
    'foo',
    'http://localhost:3000'
  );
  expect(url).toContain('code_challenge_method=S256');
});
