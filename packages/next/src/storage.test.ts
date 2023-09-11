import { PersistKey } from '@logto/node';

import NextStorage from './storage.js';

const makeSession = () => ({
  save: jest.fn(),
  destroy: jest.fn(),
});

describe('NextStorage', () => {
  describe('Basic functions', () => {
    it('should set and get item', async () => {
      const session = makeSession();
      const storage = new NextStorage(session);
      await storage.setItem(PersistKey.IdToken, 'value');
      await expect(storage.getItem(PersistKey.IdToken)).resolves.toBe('value');
    });

    it('should remove item', async () => {
      const session = makeSession();
      const storage = new NextStorage(session);
      await storage.setItem(PersistKey.IdToken, 'value');
      await storage.removeItem(PersistKey.IdToken);
      await expect(storage.getItem(PersistKey.IdToken)).resolves.toBeNull();
    });

    it('should set and get item (signInSession)', async () => {
      const session = makeSession();
      const storage = new NextStorage(session);
      await storage.setItem(PersistKey.SignInSession, 'value');
      await expect(storage.getItem(PersistKey.SignInSession)).resolves.toBe('value');
    });

    it('should remove item (signInSession)', async () => {
      const session = makeSession();
      const storage = new NextStorage(session);
      await storage.setItem(PersistKey.SignInSession, 'value');
      await storage.removeItem(PersistKey.SignInSession);
      await expect(storage.getItem(PersistKey.SignInSession)).resolves.toBeNull();
    });

    it('should destroy', async () => {
      const session = makeSession();
      const storage = new NextStorage(session);
      await storage.setItem(PersistKey.SignInSession, 'value');
      await storage.destroy();
      await expect(storage.getItem(PersistKey.SignInSession)).resolves.toBeNull();
    });
  });
});
