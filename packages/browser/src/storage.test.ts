import { BrowserStorage, logtoStorageItemKeyPrefix } from './storage.js';

describe('BrowserStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Basic functions', () => {
    it('should set and get item', async () => {
      const storage = new BrowserStorage('appId');
      await storage.setItem('idToken', 'value');
      await expect(storage.getItem('idToken')).resolves.toBe('value');
    });

    it('should remove item', async () => {
      const storage = new BrowserStorage('appId');
      await storage.setItem('idToken', 'value');
      await storage.removeItem('idToken');
      await expect(storage.getItem('idToken')).resolves.toBeNull();
    });

    it('should set and get item (signInSession)', async () => {
      const storage = new BrowserStorage('appId');
      await storage.setItem('signInSession', 'value');
      await expect(storage.getItem('signInSession')).resolves.toBe('value');
    });

    it('should remove item (signInSession)', async () => {
      const storage = new BrowserStorage('appId');
      await storage.setItem('signInSession', 'value');
      await storage.removeItem('signInSession');
      await expect(storage.getItem('signInSession')).resolves.toBeNull();
    });
  });

  describe('Real storage check', () => {
    it('should set item to localStorage', async () => {
      const storage = new BrowserStorage('appId');
      await storage.setItem('idToken', 'value');
      expect(localStorage.getItem(`${logtoStorageItemKeyPrefix}:appId:idToken`)).toBe('value');
    });

    it('should set item to sessionStorage', async () => {
      const storage = new BrowserStorage('appId');
      await storage.setItem('signInSession', 'value');
      expect(sessionStorage.getItem(`${logtoStorageItemKeyPrefix}:appId`)).toBe('value');
    });
  });
});
