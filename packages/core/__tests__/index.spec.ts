import { extractBearerToken, LogtoClient } from '../src';
import { OpenIdConfiguration } from '../src/discovery';

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
  beforeAll(() => {
    client = new LogtoClient({
      discoveryUrl: 'http://localhost:3001/oidc/.well-known/openid-configuration',
      clientId: 'foo',
    });
  });
  test('openid configuration', async () => {
    let configuration: OpenIdConfiguration;
    while (true) {
      configuration = client.getOpenIdConfiguration();
      if (configuration) {
        break;
      }

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }

    expect(configuration.authorizationEndpoint).toContain('oidc/auth');
  });
});
