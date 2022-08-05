import { IncomingMessage } from 'http';

import ExpressStorage from './storage';

const makeRequest = (): IncomingMessage => {
  const request = {
    session: {
      save: jest.fn(),
    },
  };

  return request as unknown as IncomingMessage;
};

describe('ExpressStorage', () => {
  describe('Basic functions', () => {
    it('should set and get item', async () => {
      const request = makeRequest();
      const storage = new ExpressStorage(request);
      await storage.setItem('idToken', 'value');
      expect(storage.getItem('idToken')).toBe('value');
    });

    it('should remove item', async () => {
      const request = makeRequest();
      const storage = new ExpressStorage(request);
      await storage.setItem('idToken', 'value');
      storage.removeItem('idToken');
      expect(storage.getItem('idToken')).toBeNull();
    });

    it('should set and get item (signInSession)', async () => {
      const request = makeRequest();
      const storage = new ExpressStorage(request);
      await storage.setItem('signInSession', 'value');
      expect(storage.getItem('signInSession')).toBe('value');
    });

    it('should remove item (signInSession)', async () => {
      const request = makeRequest();
      const storage = new ExpressStorage(request);
      await storage.setItem('signInSession', 'value');
      storage.removeItem('signInSession');
      expect(storage.getItem('signInSession')).toBeNull();
    });
  });
});
