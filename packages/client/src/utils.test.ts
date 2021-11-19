import { SignJWT, generateKeyPair } from 'jose';
import { StructError } from 'superstruct';

import { decodeToken, generateCallbackUri } from './utils';

const REDIRECT_URI = 'http://localhost:3000';
const CODE = 'code1';
const STATE = 'state1';
const ERROR = 'invalid_request';
const ERROR_DESCRIPTION = 'code_challenge must be a string with a minimum length of 43 characters';

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
    expect(() => decodeToken(JWT)).toThrowError(StructError);
  });
});

describe('generateCallbackUri', () => {
  test('generate callback url with redirectUri', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI });
    expect(callbackUri).toEqual('http://localhost:3000');
  });

  test('generate callback url with redirectUri and code', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE });
    expect(callbackUri).toEqual('http://localhost:3000?code=code1');
  });

  test('generate callback url with redirectUri and state', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE });
    expect(callbackUri).toEqual('http://localhost:3000?state=state1');
  });

  test('generate callback url with redirectUri, code, state and error', () => {
    const callbackUri = generateCallbackUri({
      redirectUri: REDIRECT_URI,
      code: CODE,
      state: STATE,
      error: ERROR,
    });
    expect(callbackUri).toEqual(
      'http://localhost:3000?code=code1&state=state1&error=invalid_request'
    );
  });

  test('generate callback url with full info', () => {
    const callbackUri = generateCallbackUri({
      redirectUri: REDIRECT_URI,
      code: CODE,
      state: STATE,
      error: ERROR,
      errorDescription: ERROR_DESCRIPTION,
    });
    expect(callbackUri).toEqual(
      'http://localhost:3000?code=code1&state=state1&error=invalid_request&error_description=code_challenge%20must%20be%20a%20string%20with%20a%20minimum%20length%20of%2043%20characters'
    );
  });
});
