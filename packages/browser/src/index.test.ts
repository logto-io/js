import LogtoClient from './index.js';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

describe('Browser', () => {
  it('creates an instance without crash', () => {
    expect(() => new LogtoClient({ endpoint, appId })).not.toThrow();
  });

  it('keeps cache disabled by default and enables it through the positional option', () => {
    expect(new LogtoClient({ endpoint, appId }).adapter.cache).toBeUndefined();
    expect(new LogtoClient({ endpoint, appId }, true).adapter.cache).toBeDefined();
  });
});
