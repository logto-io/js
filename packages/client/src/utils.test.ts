import { SignJWT, generateKeyPair } from 'jose';
import { ZodError } from 'zod';

import { decodeToken, generateScope } from './utils';

const OPENID = 'openid';
const OFFLINE_ACCESS = 'offline_access';
const DEFAULT_SCOPE = `${OPENID} ${OFFLINE_ACCESS}`;
const NAME = 'name';
const EMAIL = 'email';

describe('decodeToken', () => {
  test('decode token and get claims', async () => {
    const JWT = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setAudience('foo')
      .setSubject('foz')
      .setIssuer('logto')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign((await generateKeyPair('RS256')).privateKey);
    const payload = decodeToken(JWT);
    expect(payload.sub).toEqual('foz');
  });

  test('throw on invalid JWT string', async () => {
    expect(() => decodeToken('invalid-JWT')).toThrow();
  });

  test('throw ZodError when iss is missing', async () => {
    const JWT = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setAudience('foo')
      .setSubject('foz')
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign((await generateKeyPair('RS256')).privateKey);
    expect(() => decodeToken(JWT)).toThrowError(ZodError);
  });
});

describe('generateScope', () => {
  test('no argument', () => {
    expect(generateScope()).toEqual(DEFAULT_SCOPE);
  });

  test('empty string', () => {
    expect(generateScope('')).toEqual(DEFAULT_SCOPE);
  });

  test('string with blank characters', () => {
    expect(generateScope(' \t')).toEqual(DEFAULT_SCOPE);
  });

  test('string with openid offline_access', () => {
    const originalScope = DEFAULT_SCOPE;
    expect(generateScope(originalScope)).toEqual(originalScope);
  });

  test('string with openid (without default scope value offline_access)', () => {
    expect(generateScope(OPENID)).toEqual(DEFAULT_SCOPE);
  });

  test('string with openid name (without default scope value offline_access)', () => {
    expect(generateScope(`${NAME} ${OPENID}`)).toEqual(`${DEFAULT_SCOPE} ${NAME}`);
  });

  test('string with offline_access email (without default scope value openid)', () => {
    expect(generateScope(`${EMAIL} ${OFFLINE_ACCESS}`)).toEqual(`${DEFAULT_SCOPE} ${EMAIL}`);
  });

  test('string with name email (without all default scope values)', () => {
    const originalScope = `${NAME} ${EMAIL}`;
    expect(generateScope(originalScope)).toEqual(`${DEFAULT_SCOPE} ${originalScope}`);
  });

  test('empty string array', () => {
    expect(generateScope([])).toEqual(DEFAULT_SCOPE);
  });

  test('string array with openid offline_access', () => {
    expect(generateScope([OPENID, OFFLINE_ACCESS])).toEqual(DEFAULT_SCOPE);
  });

  test('string array with openid (without default scope value offline_access)', () => {
    expect(generateScope([OPENID])).toEqual(DEFAULT_SCOPE);
  });

  test('string array with openid name (without default scope value offline_access)', () => {
    expect(generateScope([NAME, OPENID])).toEqual(`${DEFAULT_SCOPE} ${NAME}`);
  });

  test('string array with offline_access email (without default scope value openid)', () => {
    expect(generateScope([EMAIL, OFFLINE_ACCESS])).toEqual(`${DEFAULT_SCOPE} ${EMAIL}`);
  });

  test('string array with name email (without all default scope values)', () => {
    expect(generateScope([NAME, EMAIL])).toEqual(`${DEFAULT_SCOPE} ${NAME} ${EMAIL}`);
  });
});
