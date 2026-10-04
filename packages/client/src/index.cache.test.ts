import { mockFetchOidcConfig } from './mock.js';

const { createClient, fetchOidcConfig } = await import('./mock.js');

fetchOidcConfig.mockImplementation(mockFetchOidcConfig(1));

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

  it('should retry fetching OpenID config after a failure', async () => {
    fetchOidcConfig.mockClear();
    fetchOidcConfig.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const logtoClient = createClient();

    await expect(logtoClient.runGetOidcConfig()).rejects.toThrow('Failed to fetch');
    expect(fetchOidcConfig).toHaveBeenCalledTimes(1);

    await expect(logtoClient.runGetOidcConfig()).resolves.toHaveProperty('tokenEndpoint');
    expect(fetchOidcConfig).toHaveBeenCalledTimes(2);
  });
});
