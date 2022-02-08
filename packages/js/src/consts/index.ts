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
  CodeVerifier = 'code_verifier',
  GrantType = 'grant_type',
  IdToken = 'id_token',
  RedirectUri = 'redirect_uri',
  RefreshToken = 'refresh_token',
  Resource = 'resource',
  Scope = 'scope',
}
