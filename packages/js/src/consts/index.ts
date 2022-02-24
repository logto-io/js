export const ContentType = {
  formUrlEncoded: { 'Content-Type': 'application/x-www-form-urlencoded' },
};

export enum TokenGrantType {
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
}

export enum QueryKey {
  ClientId = 'client_id',
  Code = 'code',
  CodeChallenge = 'code_challenge',
  CodeChallengeMethod = 'code_challenge_method',
  CodeVerifier = 'code_verifier',
  Error = 'error',
  ErrorDescription = 'error_description',
  GrantType = 'grant_type',
  IdToken = 'id_token',
  IdTokenHint = 'id_token_hint',
  PostLogoutRedirectUri = 'post_logout_redirect_uri',
  Prompt = 'prompt',
  RedirectUri = 'redirect_uri',
  RefreshToken = 'refresh_token',
  Resource = 'resource',
  ResponseType = 'response_type',
  Scope = 'scope',
  State = 'state',
  Token = 'token',
}
