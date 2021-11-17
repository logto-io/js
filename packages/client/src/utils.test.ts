import { SignJWT, generateKeyPair } from 'jose';
import { StructError } from 'superstruct';

import { decodeToken, generateCallbackUri } from './utils';

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
    const redirectUri: string = 'http://localhost:3000';
    expect(generateCallbackUri({ redirectUri: redirectUri })).toEqual('http://localhost:3000');
  });

  test('generate callback url with redirectUri and code', () => {
    const redirectUri: string = 'http://localhost:3000';
    const code: string = 'code1';
    expect(generateCallbackUri({ redirectUri: redirectUri, code: code })).toEqual(
      'http://localhost:3000?code=code1'
    );
  });

  test('generate callback url with redirectUri and state', () => {
    const redirectUri: string = 'http://localhost:3000';
    const state: string = 'state1';
    expect(generateCallbackUri({ redirectUri: redirectUri, state: state })).toEqual(
      'http://localhost:3000?state=state1'
    );
  });

  test('generate callback url with redirectUri, code, state and error', () => {
    const redirectUri: string = 'http://localhost:3000';
    const code: string = 'code1';
    const state: string = 'state1';
    const error: string = 'invalid_request';
    expect(
      generateCallbackUri({ redirectUri: redirectUri, code: code, state: state, error: error })
    ).toEqual('http://localhost:3000?code=code1&state=state1&error=invalid_request');
  });

  test('generate callback url with full info', () => {
    const redirectUri: string = 'http://localhost:3000';
    const code: string = 'code1';
    const state: string = 'state1';
    const error: string = 'invalid_request';
    const errorDescription: string =
      'code_challenge must be a string with a minimum length of 43 characters';
    expect(
      generateCallbackUri({
        redirectUri: redirectUri,
        code: code,
        state: state,
        error: error,
        errorDescription: errorDescription,
      })
    ).toEqual(
      'http://localhost:3000?code=code1&state=state1&error=invalid_request&error_description=code_challenge%20must%20be%20a%20string%20with%20a%20minimum%20length%20of%2043%20characters'
    );
  });
});
