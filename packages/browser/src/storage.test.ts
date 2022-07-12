import { BrowserStorage, logtoStorageItemKeyPrefix } from './storage';

describe('BrowserStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Basic functions', () => {
    it('should set and get item', () => {
      const storage = new BrowserStorage('appId');
      storage.setItem('idToken', 'value');
      expect(storage.getItem('idToken')).toBe('value');
    });

    it('should remove item', () => {
      const storage = new BrowserStorage('appId');
      storage.setItem('idToken', 'value');
      storage.removeItem('idToken');
      expect(storage.getItem('idToken')).toBeNull();
    });

    it('should set and get item (signInSession)', () => {
      const storage = new BrowserStorage('appId');
      storage.setItem('signInSession', 'value');
      expect(storage.getItem('signInSession')).toBe('value');
    });

    it('should remove item (signInSession)', () => {
      const storage = new BrowserStorage('appId');
      storage.setItem('signInSession', 'value');
      storage.removeItem('signInSession');
      expect(storage.getItem('signInSession')).toBeNull();
    });
  });

  describe('Real storage check', () => {
    it('should set item to localStorage', () => {
      const storage = new BrowserStorage('appId');
      storage.setItem('idToken', 'value');
      expect(localStorage.getItem(`${logtoStorageItemKeyPrefix}:appId:idToken`)).toBe('value');
    });

    it('should set item to sessionStorage', () => {
      const storage = new BrowserStorage('appId');
      storage.setItem('signInSession', 'value');
      expect(sessionStorage.getItem(`${logtoStorageItemKeyPrefix}:appId`)).toBe('value');
    });
  });
});
