import { generateKeyPair, SignJWT } from 'jose';
import { StructError } from 'superstruct';

import { decodeToken, UrlSafeBase64 } from './utils';

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

const ENCODED_CONTENT_WITH_PLUS_SIGN_AND_SLASH = 'Silverhand-io_logto';
const RAW_CONTENT = 'J)oz¸Z\u009Dß¢£ùh\u0082Ú';

describe('UrlSafeBase64.encode', () => {
  test('encode raw content whose base64-encoded content contains plus sign `+` and slash `/`', () => {
    expect(UrlSafeBase64.encode(RAW_CONTENT)).toEqual(ENCODED_CONTENT_WITH_PLUS_SIGN_AND_SLASH);
  });
});

describe('UrlSafeBase64.decode', () => {
  test('decode encoded content with plus sign `+` (replaced by minus sign `-`) and slash `/` (replaced by underscore `_`)', () => {
    expect(UrlSafeBase64.decode(ENCODED_CONTENT_WITH_PLUS_SIGN_AND_SLASH)).toEqual(RAW_CONTENT);
  });
});
