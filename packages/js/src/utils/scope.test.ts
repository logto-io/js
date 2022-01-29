import { defaultScopeString, ScopeValue, withDefaultScopeValues } from './scope';

describe('withDefaultScopeValues', () => {
  describe('should append default scope values to the head of scope string', () => {
    describe('undefined param', () => {
      test('should return DEFAULT_SCOPE_STRING if calling without parameters', () => {
        expect(withDefaultScopeValues()).toEqual(defaultScopeString);
      });
    });

    describe('string param', () => {
      test('empty', () => {
        expect(withDefaultScopeValues('')).toEqual(defaultScopeString);
      });

      test('with blank characters', () => {
        expect(withDefaultScopeValues(' \t')).toEqual(defaultScopeString);
      });

      test('with openid offline_access', () => {
        expect(withDefaultScopeValues(defaultScopeString)).toEqual(defaultScopeString);
      });

      test('with openid (without default scope value offline_access)', () => {
        expect(withDefaultScopeValues(ScopeValue.openid)).toEqual(defaultScopeString);
      });

      test('with openid name (without default scope value offline_access)', () => {
        expect(withDefaultScopeValues(`${ScopeValue.name} ${ScopeValue.openid}`)).toEqual(
          `${defaultScopeString} ${ScopeValue.name}`
        );
      });

      test('with offline_access email (without default scope value openid)', () => {
        expect(withDefaultScopeValues(`${ScopeValue.email} ${ScopeValue.offline_access}`)).toEqual(
          `${defaultScopeString} ${ScopeValue.email}`
        );
      });

      test('with name email (without all default scope values)', () => {
        const originalScope = `${ScopeValue.name} ${ScopeValue.email}`;
        expect(withDefaultScopeValues(originalScope)).toEqual(
          `${defaultScopeString} ${originalScope}`
        );
      });
    });

    describe('string array param', () => {
      test('empty', () => {
        expect(withDefaultScopeValues([])).toEqual(defaultScopeString);
      });

      test('with openid offline_access', () => {
        expect(withDefaultScopeValues([ScopeValue.openid, ScopeValue.offline_access])).toEqual(
          defaultScopeString
        );
      });

      test('with openid (without default scope value offline_access)', () => {
        expect(withDefaultScopeValues([ScopeValue.openid])).toEqual(defaultScopeString);
      });

      test('with openid name (without default scope value offline_access)', () => {
        expect(withDefaultScopeValues([ScopeValue.name, ScopeValue.openid])).toEqual(
          `${defaultScopeString} ${ScopeValue.name}`
        );
      });

      test('with offline_access email (without default scope value openid)', () => {
        expect(withDefaultScopeValues([ScopeValue.email, ScopeValue.offline_access])).toEqual(
          `${defaultScopeString} ${ScopeValue.email}`
        );
      });

      test('with name email (without all default scope values)', () => {
        expect(withDefaultScopeValues([ScopeValue.name, ScopeValue.email])).toEqual(
          `${defaultScopeString} ${ScopeValue.name} ${ScopeValue.email}`
        );
      });
    });
  });
});
