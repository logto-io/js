import {
  BaseClient,
  LogtoClientError,
  createRequester,
  type LogtoConfig,
  type ClientAdapter,
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '@logto/browser';

import { ChromeExtensionStorage } from './storage.js';

export * from '@logto/browser';
export { ChromeExtensionStorage } from './storage.js';

export default class LogtoClient extends BaseClient {
  /**
   * @param config The configuration object for the client.
   */
  constructor(config: LogtoConfig) {
    const requester = createRequester(fetch);
    // eslint-disable-next-line unicorn/consistent-function-scoping -- we use `this` in the function
    const navigate: ClientAdapter['navigate'] = async (url, params) => {
      switch (params.for) {
        case 'sign-in': {
          const responseUrl = await chrome.identity.launchWebAuthFlow({ url, interactive: true });

          if (!responseUrl) {
            throw new LogtoClientError('user_cancelled');
          }

          await this.handleSignInCallback(responseUrl);

          break;
        }
        case 'sign-out': {
          await chrome.identity.launchWebAuthFlow({
            url,
            interactive: false,
            abortOnLoadForNonInteractive: false,
            timeoutMsForNonInteractive: 10_000,
          });
          break;
        }
        default: {
          throw new Error(`Unsupported navigation for ${params.for}`);
        }
      }
    };

    super(config, {
      requester,
      navigate,
      storage: new ChromeExtensionStorage(config.appId),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }
}
