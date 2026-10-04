import { DefaultJwtVerifier } from './adapter/defaults.js';
import { type ClientAdapter, type JwtVerifier } from './adapter/index.js';
import { StandardLogtoClient } from './client.js';
import type { LogtoConfig } from './types/index.js';

export * from './shim.js';

/**
 * The Logto base client class that provides the essential methods for
 * interacting with the Logto server.
 *
 * It also provides an adapter object that allows the customizations of the
 * client behavior for different environments.
 */
export default class LogtoClient extends StandardLogtoClient {
  constructor(
    logtoConfig: LogtoConfig,
    adapter: ClientAdapter,
    buildJwtVerifier?: (client: StandardLogtoClient) => JwtVerifier
  ) {
    super(logtoConfig, adapter, buildJwtVerifier ?? ((client) => new DefaultJwtVerifier(client)));
  }
}
