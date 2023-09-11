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

              return fetch(input, {
                ...init,
                headers: {
                  Authorization: `Basic ${Buffer.from(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `${config.appId}:${config.appSecret}`,
                    'utf8'
                  ).toString('base64')}`,
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
