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
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
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
