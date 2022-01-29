import { generateSignOutUri } from './sign-out';

describe('Generate sign-out URI', () => {
  const endSessionEndpoint = 'http://logto.dev/oidc/session/end';
  const idToken = 'id_token';
  const postLogoutRedirectUri = 'http://localhost:3000';

  test('Generate with both id token and redirect URI', async () => {
    const signOutUri = generateSignOutUri({ endSessionEndpoint, idToken, postLogoutRedirectUri });

    expect(signOutUri).toContain(`${endSessionEndpoint}?`);
    expect(signOutUri).toContain(`id_token_hint=${idToken}`);
    expect(signOutUri).toContain('post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000');
  });

  test('Generate without redirect URI', async () => {
    const signOutUri = generateSignOutUri({ endSessionEndpoint, idToken });

    expect(signOutUri).toContain(`${endSessionEndpoint}?`);
    expect(signOutUri).toContain(`id_token_hint=${idToken}`);
    expect(signOutUri).not.toContain('post_logout_redirect_uri');
  });
});
