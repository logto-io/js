import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import LogtoBaseClient from '@logto/browser';

import CapacitorLogtoClient from './index.js';

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
  },
}));

vi.mock('@capacitor/browser', () => ({
  Browser: {
    open: vi.fn(),
    close: vi.fn(),
    addListener: vi.fn(),
  },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

type AppUrlOpenCallback = (event: { url: string }) => void | Promise<void>;
type BrowserFinishedCallback = () => void | Promise<void>;

type ListenerHooks = {
  appUrlOpen?: AppUrlOpenCallback;
  browserFinished?: BrowserFinishedCallback;
  appRemove: ReturnType<typeof vi.fn>;
  browserRemove: ReturnType<typeof vi.fn>;
};

const installListenerCapture = (): ListenerHooks => {
  const hooks: ListenerHooks = {
    appRemove: vi.fn(),
    browserRemove: vi.fn(),
  };
  vi.mocked(App.addListener).mockImplementation(
    // @ts-expect-error -- mocking the union signature without enumerating every overload
    async (event: string, callback: AppUrlOpenCallback) => {
      if (event === 'appUrlOpen') {
        // eslint-disable-next-line @silverhand/fp/no-mutation -- test hook capture
        hooks.appUrlOpen = callback;
      }
      return { remove: hooks.appRemove };
    }
  );
  vi.mocked(Browser.addListener).mockImplementation(
    async (event: string, callback: BrowserFinishedCallback) => {
      if (event === 'browserFinished') {
        // eslint-disable-next-line @silverhand/fp/no-mutation -- test hook capture
        hooks.browserFinished = callback;
      }
      return { remove: hooks.browserRemove };
    }
  );
  return hooks;
};

class CapacitorLogtoClientTest extends CapacitorLogtoClient {
  getAdapter() {
    return this.adapter;
  }
}

const createClient = () =>
  new CapacitorLogtoClientTest({
    endpoint: 'https://your.logto.endpoint',
    appId: 'your-app-id',
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Browser.open).mockResolvedValue();
  vi.mocked(Browser.close).mockResolvedValue();
});

describe('CapacitorLogtoClient', () => {
  it('should override navigate', async () => {
    const client = createClient();
    expect(client.getAdapter().navigate).toBeDefined();
    await client.getAdapter().navigate('https://example.com', { for: 'sign-in' });

    expect(Browser.open).toHaveBeenCalledWith({
      url: 'https://example.com',
      windowName: '_self',
      presentationStyle: 'popover',
    });
  });

  describe('signIn error propagation', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should reject when super.signIn() rejects and clean up listeners', async () => {
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signIn').mockRejectedValue(new Error('network down'));

      const client = createClient();
      await expect(client.signIn('io.logto.example://callback')).rejects.toThrow('network down');

      expect(hooks.appRemove).toHaveBeenCalledTimes(1);
      expect(hooks.browserRemove).toHaveBeenCalledTimes(1);
    });

    it('should reject if App.addListener rejects at bootstrap', async () => {
      const hooks = installListenerCapture();
      vi.mocked(App.addListener).mockRejectedValueOnce(new Error('plugin unavailable'));

      const client = createClient();
      await expect(client.signIn('io.logto.example://callback')).rejects.toThrow(
        'plugin unavailable'
      );
      // The browser listener still registered successfully and must be cleaned up.
      expect(hooks.browserRemove).toHaveBeenCalledTimes(1);
    });

    it('should reject with user_cancelled when browser is closed before redirect', async () => {
      vi.useFakeTimers();
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signIn').mockResolvedValue();

      const client = createClient();
      const pending = client.signIn('io.logto.example://callback');
      // Capture the rejection synchronously so vitest's unhandled-rejection detector
      // doesn't fire in the gap between reject() and the awaited expectation.
      // eslint-disable-next-line promise/prefer-await-to-then
      const errorPromise = pending.then(
        () => {
          throw new Error('expected signIn to reject');
        },
        (error: unknown) => error
      );

      expect(hooks.browserFinished).toBeDefined();
      const handlerDone = hooks.browserFinished?.();
      await vi.advanceTimersByTimeAsync(150);
      await handlerDone;

      expect(await errorPromise).toMatchObject({ code: 'user_cancelled' });
      expect(hooks.appRemove).toHaveBeenCalledTimes(1);
      expect(hooks.browserRemove).toHaveBeenCalledTimes(1);
    });

    it('should resolve when the deep-link redirect arrives and the callback succeeds', async () => {
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signIn').mockResolvedValue();

      const client = createClient();
      vi.spyOn(client, 'handleSignInCallback').mockResolvedValue();

      const pending = client.signIn('io.logto.example://callback');
      await vi.waitFor(() => {
        expect(hooks.appUrlOpen).toBeDefined();
      });
      await hooks.appUrlOpen?.({ url: 'io.logto.example://callback?code=abc' });

      await expect(pending).resolves.toBeUndefined();
      expect(Browser.close).toHaveBeenCalled();
      expect(hooks.appRemove).toHaveBeenCalledTimes(1);
      expect(hooks.browserRemove).toHaveBeenCalledTimes(1);
    });

    it('should reject when handleSignInCallback fails after deep link', async () => {
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signIn').mockResolvedValue();
      const callbackError = new Error('token exchange failed');

      const client = createClient();
      vi.spyOn(client, 'handleSignInCallback').mockRejectedValue(callbackError);

      const pending = client.signIn('io.logto.example://callback');
      await vi.waitFor(() => {
        expect(hooks.appUrlOpen).toBeDefined();
      });
      await hooks.appUrlOpen?.({ url: 'io.logto.example://callback?code=abc' });

      await expect(pending).rejects.toBe(callbackError);
      expect(hooks.appRemove).toHaveBeenCalledTimes(1);
      expect(hooks.browserRemove).toHaveBeenCalledTimes(1);
      expect(Browser.close).toHaveBeenCalled();
    });
  });

  describe('signOut error and cancel propagation', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should reject when super.signOut() rejects and clean up the listener', async () => {
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signOut').mockRejectedValue(new Error('revoke failed'));

      const client = createClient();
      await expect(client.signOut('io.logto.example://logout')).rejects.toThrow('revoke failed');

      // Only the appUrlOpen listener is registered when postLogoutRedirectUri is set.
      expect(hooks.appRemove).toHaveBeenCalledTimes(1);
      expect(hooks.browserRemove).not.toHaveBeenCalled();
    });

    it('should resolve via appUrlOpen when the redirect deep link arrives', async () => {
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signOut').mockResolvedValue();

      const client = createClient();
      const pending = client.signOut('io.logto.example://logout');
      await vi.waitFor(() => {
        expect(hooks.appUrlOpen).toBeDefined();
      });
      await hooks.appUrlOpen?.({ url: 'io.logto.example://logout' });

      await expect(pending).resolves.toBeUndefined();
      expect(Browser.close).toHaveBeenCalled();
    });

    it('should resolve via browserFinished when no postLogoutRedirectUri is provided', async () => {
      const hooks = installListenerCapture();
      vi.spyOn(LogtoBaseClient.prototype, 'signOut').mockResolvedValue();

      const client = createClient();
      const pending = client.signOut();
      await vi.waitFor(() => {
        expect(hooks.browserFinished).toBeDefined();
      });
      await hooks.browserFinished?.();

      await expect(pending).resolves.toBeUndefined();
      // No deep-link listener is registered when there's no redirect URI to match.
      expect(hooks.appUrlOpen).toBeUndefined();
      expect(hooks.appRemove).not.toHaveBeenCalled();
      expect(hooks.browserRemove).toHaveBeenCalledTimes(1);
    });
  });
});
