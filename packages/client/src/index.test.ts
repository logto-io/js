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
    const [url, codeVerifier] = client.getLoginUrlAndCodeVerifier();
    console.log(url);
    console.log(codeVerifier);
    expect(typeof url).toEqual('string');
    expect(typeof codeVerifier).toEqual('string');
  });
  test('handle callback and get tokenset', async () => {
    if (!process.env.CODE || !process.env.CODE_VERIFIER) {
      // Skip
      expect(1).toEqual(1);
    }

    const tokenset = await client.handleLoginCallback(
      'http://localhost:3000/callback',
      process.env.CODE_VERIFIER || '',
      process.env.CODE || ''
    );
    expect(tokenset).not.toBeNull();
  });
});
