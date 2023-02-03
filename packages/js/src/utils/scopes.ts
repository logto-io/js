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

/**
 * @param originalScopes
 * @return scopes should contain all default scopes (`openid`, `offline_access` and `profile`)
 */
export const withDefaultScopes = (originalScopes?: string[]): string => {
  const reservedScopes = Object.values(ReservedScope);
  const uniqueScopes = new Set([...reservedScopes, UserScope.Profile, ...(originalScopes ?? [])]);

  return Array.from(uniqueScopes).join(' ');
};
