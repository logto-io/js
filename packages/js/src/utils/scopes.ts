import { ReservedScope, UserScope } from '../consts/index.js';

/**
 * @param originalScopes
 * @return scopes should contain all default scopes (`openid`, `offline_access` and `profile`)
 */
export const withReservedScopes = (originalScopes?: string[]): string => {
  const reservedScopes = Object.values(ReservedScope);
  const uniqueScopes = new Set([...reservedScopes, UserScope.Profile, ...(originalScopes ?? [])]);

  return Array.from(uniqueScopes).join(' ');
};

/**
 * Alias of {@link withReservedScopes}.
 *
 * @deprecated Use {@link withReservedScopes} instead.
 */
export const withDefaultScopes = withReservedScopes;
