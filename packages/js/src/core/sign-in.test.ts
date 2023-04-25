import { Prompt, UserScope } from '../consts/index.js';

import { generateSignInUri } from './sign-in.js';

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
      scopes: [UserScope.Email, UserScope.Phone],
      resources: ['resource1', 'resource2'],
      prompt: Prompt.Login,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=login&scope=openid+offline_access+profile+email+phone&resource=resource1&resource=resource2'
    );
  });

  test('with interactionMode', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      interactionMode: 'signUp',
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile&interaction_mode=signUp'
    );
  });
});
