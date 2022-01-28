import { generateSignInUri } from './sign-in';

const authorizationEndpoint = 'https://logto.dev/oidc/sign-in';
const clientId = 'clientId';
const redirectUri = 'https://example.com/callback';
const codeChallenge = 'codeChallenge';
const state = 'state';

describe('generateSignInUri', () => {
  test('without scope and resource', () => {
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&code_challenge=codeChallenge&code_challenge_method=S256&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=code&scope=openid%20offline_access&state=state'
    );
  });

  test('without scope string containing only one scope value', () => {
    const scope = 'scope';
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scope,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&code_challenge=codeChallenge&code_challenge_method=S256&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=code&scope=openid%20offline_access%20scope&state=state'
    );
  });

  test('without scope string containing more than one scope values', () => {
    const scope = 'scope1 scope2';
    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scope,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&code_challenge=codeChallenge&code_challenge_method=S256&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=code&scope=openid%20offline_access%20scope1%20scope2&state=state'
    );
  });

  test('without scope array and resource array', () => {
    const scope = ['scope1', 'scope2'];
    const resource = ['resource1', 'resource2'];

    const signInUri = generateSignInUri({
      authorizationEndpoint,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scope,
      resource,
    });
    expect(signInUri).toEqual(
      'https://logto.dev/oidc/sign-in?client_id=clientId&code_challenge=codeChallenge&code_challenge_method=S256&prompt=consent&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=code&scope=openid%20offline_access%20scope1%20scope2&state=state&resource=resource1&resource=resource2'
    );
  });
});
