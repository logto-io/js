import { ReservedScope, UserScope } from '../consts/index.js';

import { withReservedScopes } from './scopes.js';

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
    expect(withReservedScopes()).toEqual(defaultScopesString);
  });

  test('with nothing', () => {
    expect(withReservedScopes([])).toEqual(defaultScopesString);
  });

  test('with default scope "profile"', () => {
    expect(withReservedScopes([profile])).toEqual(defaultScopesString);
  });

  test('with all default scopes', () => {
    expect(withReservedScopes([openid, offlineAccess, profile])).toEqual(defaultScopesString);
  });

  test('with "profile" and "email"', () => {
    expect(withReservedScopes([profile, email])).toEqual(`${defaultScopesString} ${email}`);
  });

  test('with "email" and "phone"', () => {
    expect(withReservedScopes([email, phone])).toEqual(`${defaultScopesString} ${email} ${phone}`);
  });

  test('with all user scopes', () => {
    expect(withReservedScopes(userScopes)).toEqual(`${reservedScopeString} ${userScopesString}`);
  });
});
