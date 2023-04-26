import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';

import LogtoNextBaseClient from './client.js';
import type { LogtoNextConfig } from './types.js';

export { ReservedScope, UserScope } from '@logto/node';

export type { LogtoContext, InteractionMode } from '@logto/node';

export default class LogtoClient extends LogtoNextBaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      withIronSessionApiRoute,
      withIronSessionSsr,
    });
  }
}
