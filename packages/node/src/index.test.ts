import LogtoClient from '.';

const appId = 'app_id_value';
const endpoint = 'https://logto.dev';

const navigate = jest.fn();
const storage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
};

describe('LogtoClient', () => {
  describe('constructor', () => {
    it('constructor should not throw', () => {
      expect(() => new LogtoClient({ endpoint, appId }, { navigate, storage })).not.toThrow();
    });
  });
});
