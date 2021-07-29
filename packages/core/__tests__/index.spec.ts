import { extractBearerToken, LogtoClient } from '../src';

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
    const token = extractBearerToken('bearertesttoken');
    expect(token).toBeNull();
  });
  test('testtoken', () => {
    const token = extractBearerToken('testtoken');
    expect(token).toBeNull();
  });
  test('empty string', () => {
    const token = extractBearerToken('');
    expect(token).toBeNull();
  });
  test('empty input', () => {
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    const token = extractBearerToken();
    expect(token).toBeNull();
  });
});

describe('init client', () => {
  let client: LogtoClient;
  beforeAll((done) => {
    client = new LogtoClient(
      {
        discoveryUrl: 'http://localhost:3001/oidc/.well-known/openid-configuration',
        clientId: 'foo',
      },
      done
    );
  });
  test('openid configuration', async () => {
    const configuration = client.getOpenIdConfiguration();
    expect(configuration.authorization_endpoint).toContain('oidc/auth');
  });
  test('jwks', async () => {
    const jwks = client.getJWKS();
    expect(jwks[0].kty).toEqual('RSA');
  });
});