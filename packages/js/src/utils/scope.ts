export enum ScopeValue {
  name = 'name',
  email = 'email',
  offline_access = 'offline_access',
  openid = 'openid',
}

export const defaultScopeValues = [ScopeValue.openid, ScopeValue.offline_access];
export const defaultScopeString = defaultScopeValues.join(' ');

/**
 * @param originalScope
 * @return scope should contains all default scope values ( Logto requires `openid` and `offline_access` )
 */
export const withDefaultScopeValues = (originalScope?: string | string[]): string => {
  const originalScopeValues =
    originalScope === undefined
      ? []
      : Array.isArray(originalScope)
      ? originalScope
      : originalScope.split(' ');
  const nonEmptyScopeValues = originalScopeValues.map((s) => s.trim()).filter((s) => s.length > 0);
  const uniqueScopeValues = new Set([...defaultScopeValues, ...nonEmptyScopeValues]);

  return Array.from(uniqueScopeValues).join(' ');
};
