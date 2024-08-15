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

  test('with prompt array', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      prompt: [Prompt.Consent, Prompt.Login],
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent+login&scope=openid+offline_access+profile'
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

  test('with loginHint', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      loginHint: 'johndoe@example.com',
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile&login_hint=johndoe%40example.com'
    );
  });

  test('with firstScreen and interactionMode', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      firstScreen: 'register',
      interactionMode: 'signIn',
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile&first_screen=register'
    );
  });

  test('with identifier', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      firstScreen: 'identifier:sign_in',
      identifiers: ['email', 'phone'],
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile&first_screen=identifier%3Asign_in&identifier=email+phone'
    );
  });

  test('with directSignIn', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      directSignIn: {
        method: 'social',
        target: 'google',
      },
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile&direct_sign_in=social%3Agoogle'
    );
  });

  test('with extraParams', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      extraParams: {
        foo: 'bar',
        baz: 'qux',
      },
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent&scope=openid+offline_access+profile&foo=bar&baz=qux'
    );
  });

  test('with no reserved scopes', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      includeReservedScopes: false,
    });

    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&code_challenge=codeChallenge&code_challenge_method=S256&state=state&response_type=code&prompt=consent'
    );
  });
});
