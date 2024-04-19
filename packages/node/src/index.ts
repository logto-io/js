import type { LogtoConfig, ClientAdapter, StandardLogtoClient, JwtVerifier } from '@logto/client';
import { createRequester } from '@logto/client';

import { generateCodeChallenge, generateCodeVerifier, generateState } from '../edge/generators.js';

import BaseClient from './client.js';

export * from './exports.js';

export default class LogtoClient extends BaseClient {
  constructor(
    config: LogtoConfig,
    adapter: Partial<ClientAdapter> & Pick<ClientAdapter, 'navigate' | 'storage'>,
    buildJwtVerifier?: (client: StandardLogtoClient) => JwtVerifier
  ) {
    super(
      config,
      {
        requester: createRequester(
          config.appSecret
            ? async (...args: Parameters<typeof fetch>) => {
                const [input, init] = args;

                return fetch(input, {
                  ...init,
                  headers: {
                    Authorization: `Basic ${Buffer.from(
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
        ...adapter,
      },
      buildJwtVerifier
    );
  }
}
