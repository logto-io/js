import { withReservedScopes } from './scopes';

const email = 'email';
const name = 'name';
const offlineAccess = 'offline_access';
const openid = 'openid';
const reservedScopes = [openid, offlineAccess];
const reservedScopesString = reservedScopes.join(' ');

describe('withReservedScopes', () => {
  test('with undefined param', () => {
    expect(withReservedScopes()).toEqual(reservedScopesString);
  });

  test('with nothing', () => {
    expect(withReservedScopes([])).toEqual(reservedScopesString);
  });

  test('with all reserved scopes, openid and offline_access', () => {
    expect(withReservedScopes([openid, offlineAccess])).toEqual(reservedScopesString);
  });

  test('with openid (without reserved offline_access)', () => {
    expect(withReservedScopes([openid])).toEqual(reservedScopesString);
  });

  test('with openid name (without reserved offline_access)', () => {
    expect(withReservedScopes([name, openid])).toEqual(`${reservedScopesString} ${name}`);
  });

  test('with offline_access email (without reserved openid)', () => {
    expect(withReservedScopes([email, offlineAccess])).toEqual(`${reservedScopesString} ${email}`);
  });

  test('with name email (without all reserved scopes)', () => {
    expect(withReservedScopes([name, email])).toEqual(`${reservedScopesString} ${name} ${email}`);
  });
});
