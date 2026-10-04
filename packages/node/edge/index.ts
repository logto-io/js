import type { LogtoConfig, ClientAdapter } from '@logto/client';
import { encode } from 'js-base64';

import BaseClient from '../src/client.js';
import {
  createAuthenticatedFetch,
  resolveAdapterTransport,
} from '../src/utils/adapter-transport.js';
import { resolveAdapterCache } from '../src/utils/cache.js';

import { generateCodeChallenge, generateCodeVerifier, generateState } from './generators.js';

export { CacheKey, PersistKey, ReservedResource, decodeAccessToken } from '@logto/client';

type EdgeClientAdapter = Pick<ClientAdapter, 'navigate' | 'storage'> &
  Partial<Pick<ClientAdapter, 'cache' | 'unstable_cache' | 'fetch' | 'requester'>>;

// Used for edge runtime, currently only NextJS.
export default class LogtoClient extends BaseClient {
  constructor(config: LogtoConfig, adapter: EdgeClientAdapter) {
    const { appId, appSecret } = config;
    const { navigate, storage } = adapter;
    const defaultFetch = appSecret
      ? createAuthenticatedFetch(`Basic ${encode(`${appId}:${appSecret}`)}`)
      : undefined;
    const transport = resolveAdapterTransport(adapter, defaultFetch);

    super(config, {
      navigate,
      storage,
      generateCodeChallenge,
      generateCodeVerifier,
      generateState,
      cache: resolveAdapterCache(adapter, config.endpoint),
      ...transport,
    });
  }
}
