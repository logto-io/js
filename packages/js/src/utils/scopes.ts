/**
 * @param originalScopes
 * @return scopes should contain all reserved scopes ( Logto requires `openid` and `offline_access` )
 */
export const withReservedScopes = (originalScopes?: string[]): string => {
  const uniqueScopes = new Set(['openid', 'offline_access', 'profile', ...(originalScopes ?? [])]);

  return Array.from(uniqueScopes).join(' ');
};
