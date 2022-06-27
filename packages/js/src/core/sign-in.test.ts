import { PromptValue } from '../consts';
import { generateSignInUri } from './sign-in';

const authorizationEndpoint = 'https://logto.dev/oidc/sign-in';
const clientId = 'clientId';
const redirectUri = 'https://example.com/callback';
const codeChallenge = 'codeChallenge';
const state = 'state';

describe('generateSignInUri', () => {
  test('without prompt, scopes and resources', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile'
    );
  });

  test('with prompt, scopes and resources', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scopes: ['scope1', 'scope2'],
      resources: ['resource1', 'resource2'],
      prompt: PromptValue.Login,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=login&scope=openid+offline_access+profile+scope1+scope2&resource=resource1&resource=resource2'
    );
  });
});
