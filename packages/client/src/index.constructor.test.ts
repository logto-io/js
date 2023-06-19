import { Prompt } from '@logto/js';

import { appId, endpoint, LogtoClientWithAccessors, createClient, createAdapters } from './mock.js';

describe('LogtoClient', () => {
  describe('constructor', () => {
    it('should not throw', () => {
      expect(() => createClient()).not.toThrow();
    });

    it('should append reserved scopes', () => {
      const logtoClient = new LogtoClientWithAccessors(
        { endpoint, appId, scopes: ['foo'] },
        createAdapters()
      );
      expect(logtoClient.getLogtoConfig()).toHaveProperty('scopes', [
        'openid',
        'offline_access',
        'profile',
        'foo',
      ]);
    });

    it('should use the default prompt value "consent" if we does not provide the custom prompt', () => {
      const logtoClient = new LogtoClientWithAccessors({ endpoint, appId }, createAdapters());
      expect(logtoClient.getLogtoConfig()).toHaveProperty('prompt', Prompt.Consent);
    });

    it('should use the custom prompt value "login"', () => {
      const logtoClient = new LogtoClientWithAccessors(
        { endpoint, appId, prompt: Prompt.Login },
        createAdapters()
      );
      expect(logtoClient.getLogtoConfig()).toHaveProperty('prompt', 'login');
    });
  });
});
