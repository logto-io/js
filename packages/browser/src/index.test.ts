import LogtoClient from './index.js';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

describe('Browser', () => {
  it('creates an instance without crash', () => {
    expect(() => new LogtoClient({ endpoint, appId })).not.toThrow();
  });
});
