import { generateSignInUri } from './sign-in';

const authorizationEndpoint = 'https://logto.dev/oidc/sign-in';
const clientId = 'clientId';
const redirectUri = 'https://example.com/callback';
const codeChallenge = 'codeChallenge';
const state = 'state';

describe('generateSignInUri', () => {
  test('without scopes and resources', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&code_challenge=codeChallenge&code_challenge_method=S256&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=authorization_code&scope=openid%20offline_access&state=state'
    );
  });

  test('with scopes and resources', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scopes: ['scope1', 'scope2'],
      resources: ['resource1', 'resource2'],
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&code_challenge=codeChallenge&code_challenge_method=S256&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&resource=resource1&resource=resource2&response_type=authorization_code&scope=openid%20offline_access%20scope1%20scope2&state=state'
    );
  });
});
