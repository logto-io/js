import type { LogtoConfig, ClientAdapter } from '@logto/client';
import { createRequester } from '@logto/client';
import { encode } from 'js-base64';

import BaseClient from '../src/client.js';
import { createMemoryCache } from '../src/utils/cache.js';

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

              const base64Credentials = encode(`${config.appId}:${config.appSecret ?? ''}`);

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
      unstable_cache: createMemoryCache(config.endpoint),
    });
  }
}
