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
    expect(callbackUri).toEqual(REDIRECT_URI);
  });

  test('generate callback url with redirectUri and code', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, code: CODE });
    expect(callbackUri).toEqual(`${REDIRECT_URI}?code=${CODE}`);
  });

  test('generate callback url with redirectUri and state', () => {
    const callbackUri = generateCallbackUri({ redirectUri: REDIRECT_URI, state: STATE });
    expect(callbackUri).toEqual(`${REDIRECT_URI}?state=${STATE}`);
  });

  test('generate callback url with redirectUri, code, state and error', () => {
    const callbackUri = generateCallbackUri({
      redirectUri: REDIRECT_URI,
      code: CODE,
      state: STATE,
      error: ERROR,
    });
    expect(callbackUri).toEqual(`${REDIRECT_URI}?code=${CODE}&state=${STATE}&error=${ERROR}`);
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
      encodeURI(
        `${REDIRECT_URI}?code=${CODE}&state=${STATE}&error=${ERROR}&error_description=${ERROR_DESCRIPTION}`
      )
    );
  });
});
