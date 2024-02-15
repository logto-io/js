import { createClient, mockFetchOidcConfig } from './mock.js';

const fetchOidcConfig = mockFetchOidcConfig(1);

jest.mock('@logto/js', () => ({
  ...jest.requireActual('@logto/js'),
  fetchOidcConfig: async () => fetchOidcConfig(),
}));

describe('LogtoClient cache', () => {
  it('should memoize fetch promise and cache OpenID config', async () => {
    const logtoClient = createClient(undefined, undefined, true);
    const [config1, config2] = await Promise.all([
      logtoClient.runGetOidcConfig(),
      logtoClient.runGetOidcConfig(),
    ]);
    expect(fetchOidcConfig).toHaveBeenCalledTimes(1);
    expect(config1).toBe(config2);

    const [config3, config4] = await Promise.all([
      logtoClient.runGetOidcConfig(),
      logtoClient.runGetOidcConfig(),
    ]);
    expect(fetchOidcConfig).toHaveBeenCalledTimes(1);
    expect(config3).toBe(config4);
  });
});
