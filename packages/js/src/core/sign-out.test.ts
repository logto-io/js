import { generateSignOutUri } from './sign-out.js';

describe('Generate sign-out URI', () => {
  const endSessionEndpoint = 'http://logto.dev/oidc/session/end';
  const clientId = 'client_id';
  const postLogoutRedirectUri = 'http://localhost:3000';

  test('Generate with both id token and redirect URI', async () => {
    const signOutUri = generateSignOutUri({ endSessionEndpoint, clientId, postLogoutRedirectUri });

    expect(signOutUri).toContain(`${endSessionEndpoint}?`);
    expect(signOutUri).toContain(`client_id=${clientId}`);
    expect(signOutUri).toContain('post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000');
  });

  test('Generate without redirect URI', async () => {
    const signOutUri = generateSignOutUri({ endSessionEndpoint, clientId });

    expect(signOutUri).toContain(`${endSessionEndpoint}?`);
    expect(signOutUri).toContain(`client_id=${clientId}`);
    expect(signOutUri).not.toContain('post_logout_redirect_uri');
  });
});
