import { getLogoutUrl } from './request-logout';

test('getLogoutUrl', () => {
  const url = getLogoutUrl(
    'http://logto.dev/oidc/session/end',
    'id_token',
    'http://localhost:3000'
  );
  expect(url).toContain('id_token_hint=id_token');
});
