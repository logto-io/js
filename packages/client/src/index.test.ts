import { randomBytes } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { extractBearerToken, LogtoClient } from '.';

describe('extractBearerToken', () => {
  test('bearer testtoken', () => {
    const token = extractBearerToken('bearer testtoken');
    expect(token).toEqual('testtoken');
  });
  test('Bearer testtoken', () => {
    const token = extractBearerToken('Bearer testtoken');
    expect(token).toEqual('testtoken');
  });
  test('bearertesttoken', () => {
    expect(() => extractBearerToken('bearertesttoken')).toThrow();
  });
  test('testtoken', () => {
    expect(() => extractBearerToken('testtoken')).toThrow();
  });
  test('empty string', () => {
    expect(() => extractBearerToken('')).toThrow();
  });
  test('empty input', () => {
    // @ts-expect-error
    expect(() => extractBearerToken()).toThrow();
  });
});

describe('init client', () => {
  let client: LogtoClient;
  beforeAll((done) => {
    client = new LogtoClient(
      {
        logtoUrl: 'https://logto.dev',
        clientId: 'foo',
      },
      done
    );
  });
  test('openid configuration', async () => {
    const configuration = client.issuer?.metadata;
    expect(configuration?.authorization_endpoint).toContain('oidc/auth');
  });
  test('get login url and codeVerifier', () => {
    const [url, codeVerifier] = client.getLoginUrlAndCodeVerifier('http://localhost:3000/callback');
    expect(url).toContain('https://logto.dev');
    expect(codeVerifier.length).toBeGreaterThan(10);
  });
});

const generateRandomString = (length: number) =>
  randomBytes(30)
    .toString('hex')
    .slice(0, length - 1);

const access_token = generateRandomString(43);
const refresh_token = generateRandomString(43);
const sub = generateRandomString(8);
const id_token = jwt.sign(
  {
    sub,
    at_hash: 'RHPz55byGq-p81hfzGVYfA',
    aud: 'foo',
    exp: Math.floor(Date.now() / 1000) + 1000,
    iat: Math.floor(Date.now() / 1000),
    iss: 'https://logto.dev/oidc',
  },
  'secret'
);
const scope = 'openid offline_access';
const token_type = 'Bearer';

describe('setToken', () => {
  let client: LogtoClient;
  beforeAll((done) => {
    client = new LogtoClient(
      {
        logtoUrl: 'https://logto.dev',
        clientId: 'foo',
      },
      () => {
        client.setToken({
          access_token,
          expires_at: Math.floor(Date.now() / 1000) + 1000,
          id_token,
          refresh_token,
          scope,
          token_type,
        });
        done();
      }
    );
  });

  test('should be authenticated', () => {
    expect(client.isAuthenticated).toBeTruthy();
  });

  test('should have accessToken', () => {
    expect(client.accessToken).toEqual(access_token);
  });

  test('should have id_token', () => {
    expect(client.idToken).toEqual(id_token);
  });

  test('should have subject', () => {
    expect(client.subject).toEqual(sub);
  });
});

describe('setToken with expired input', () => {
  let client: LogtoClient;
  beforeAll((done) => {
    client = new LogtoClient(
      {
        logtoUrl: 'https://logto.dev',
        clientId: 'foo',
      },
      () => {
        client.setToken({
          access_token,
          expires_at: Math.floor(Date.now() / 1000) - 1,
          id_token,
          refresh_token,
          scope,
          token_type,
        });
        done();
      }
    );
  });

  test('should not be authenticated', () => {
    expect(client.isAuthenticated).toBeFalsy();
  });

  test('should throw on getting accessToken', () => {
    expect(() => client.accessToken).toThrow();
  });
});
