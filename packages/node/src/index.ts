import type { LogtoConfig, ClientAdapter, StandardLogtoClient, JwtVerifier } from '@logto/client';

import { generateCodeChallenge, generateCodeVerifier, generateState } from '../edge/generators.js';

import BaseClient from './client.js';
import { createAuthenticatedFetch, resolveAdapterTransport } from './utils/adapter-transport.js';
import { resolveAdapterCache } from './utils/cache.js';

export * from './exports.js';

export default class LogtoClient extends BaseClient {
  constructor(
    config: LogtoConfig,
    adapter: Partial<ClientAdapter> & Pick<ClientAdapter, 'navigate' | 'storage'>,
    buildJwtVerifier?: (client: StandardLogtoClient) => JwtVerifier
  ) {
    const { appId, appSecret } = config;
    const defaultFetch = appSecret
      ? createAuthenticatedFetch(
          `Basic ${Buffer.from(`${appId}:${appSecret}`, 'utf8').toString('base64')}`
        )
      : undefined;
    const transport = resolveAdapterTransport(adapter, defaultFetch);

    super(
      config,
      {
        generateCodeChallenge,
        generateCodeVerifier,
        generateState,
        ...adapter,
        cache: resolveAdapterCache(adapter, config.endpoint),
        ...transport,
      },
      buildJwtVerifier
    );
  }
}
