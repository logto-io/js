import type { LogtoConfig, ClientAdapter } from '@logto/client';
import { createRequester } from '@logto/client';

import BaseClient from '../src/client.js';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators.js';

export { PersistKey } from '@logto/client';

// Used for edge runtime, currently only NextJS.
export default class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig, adapter: Pick<ClientAdapter, 'navigate' | 'storage'>) {
    super(config, {
      ...adapter,
      requester: createRequester(
        config.appSecret
          ? async (...args: Parameters<typeof fetch>) => {
              const [input, init] = args;

              // Encode to base64 using btoa
              const base64Credentials = btoa(`${config.appId}:${config.appSecret ?? ''}`);

              return fetch(input, {
                ...init,
                headers: {
                  Authorization: `Basic ${base64Credentials}`,
                  ...init?.headers,
                },
              });
            }
          : fetch
      ),
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
    });
  }
}
