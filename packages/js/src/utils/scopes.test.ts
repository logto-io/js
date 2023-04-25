import { ReservedScope, UserScope } from '../consts/index.js';

import { withDefaultScopes } from './scopes.js';

const offlineAccess = ReservedScope.OfflineAccess;
const openid = ReservedScope.OpenId;
const profile = UserScope.Profile;
const email = UserScope.Email;
const phone = UserScope.Phone;
const defaultScopes = [openid, offlineAccess, profile];
const defaultScopesString = defaultScopes.join(' ');
const userScopes = Object.values(UserScope);
const userScopesString = userScopes.join(' ');
const reservedScopeString = Object.values(ReservedScope).join(' ');

describe('withReservedScopes', () => {
  test('with undefined param', () => {
    expect(withDefaultScopes()).toEqual(defaultScopesString);
  });

  test('with nothing', () => {
    expect(withDefaultScopes([])).toEqual(defaultScopesString);
  });

  test('with default scope "profile"', () => {
    expect(withDefaultScopes([profile])).toEqual(defaultScopesString);
  });

  test('with all default scopes', () => {
    expect(withDefaultScopes([openid, offlineAccess, profile])).toEqual(defaultScopesString);
  });

  test('with "profile" and "email"', () => {
    expect(withDefaultScopes([profile, email])).toEqual(`${defaultScopesString} ${email}`);
  });

  test('with "email" and "phone"', () => {
    expect(withDefaultScopes([email, phone])).toEqual(`${defaultScopesString} ${email} ${phone}`);
  });

  test('with all user scopes', () => {
    expect(withDefaultScopes(userScopes)).toEqual(`${reservedScopeString} ${userScopesString}`);
  });
});
