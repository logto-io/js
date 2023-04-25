import BaseClient from '../src/client';
import type { LogtoNextConfig } from '../src/types.js';

import { withIronSessionApiRoute, withIronSessionSsr } from './iron-session-edge';

export { ReservedScope, UserScope } from '@logto/node';

export type { LogtoContext, InteractionMode } from '@logto/node';

export default class LogtoClient extends BaseClient {
  constructor(config: LogtoNextConfig) {
    super(config, {
      withIronSessionApiRoute,
      withIronSessionSsr,
    });
  }
}
