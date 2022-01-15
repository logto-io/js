export enum ScopeValue {
  email = 'email',
  name = 'name',
  offline_access = 'offline_access',
  openid = 'openid',
}

export const DEFAULT_SCOPE_VALUES = [ScopeValue.openid, ScopeValue.offline_access];
export const DEFAULT_SCOPE_STRING = DEFAULT_SCOPE_VALUES.join(' ');
