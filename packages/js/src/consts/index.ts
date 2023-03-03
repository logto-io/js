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
  // Need to align with the OIDC extraParams settings in core
  InteractionMode = 'interaction_mode',
}

export enum Prompt {
  Consent = 'consent',
  Login = 'login',
}

// TODO: @sijie @charles find a proper way to sync scopes constants with core
export enum ReservedScope {
  OpenId = 'openid',
  OfflineAccess = 'offline_access',
}

/**
 * Scopes for ID Token and Userinfo Endpoint.
 */
export enum UserScope {
  /**
   * Scope for basic user info.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Profile = 'profile',
  /**
   * Scope for user email address.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Email = 'email',
  /**
   * Scope for user phone number.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Phone = 'phone',
  /**
   * Scope for user's custom data.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  CustomData = 'custom_data',
  /**
   * Scope for user's social identity details.
   *
   * See {@link idTokenClaims} for mapped claims in ID Token and {@link userinfoClaims} for additional claims in Userinfo Endpoint.
   */
  Identities = 'identities',
}
