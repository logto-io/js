import type { GetContextParameters } from '@logto/node';
import { type IronSession } from 'iron-session';

import NextStorage from './storage';
import type { Adapters, LogtoNextConfig } from './types';

export default class LogtoNextBaseClient {
  protected navigateUrl?: string;
  protected storage?: NextStorage;
  constructor(
    protected readonly config: LogtoNextConfig,
    protected readonly adapters: Adapters
  ) {}

  protected createNodeClient(session: IronSession) {
    this.storage = new NextStorage(session);

    return new this.adapters.NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url;
      },
    });
  }

  protected get ironSessionConfigs() {
    return {
      cookieName: `logto:${this.config.appId}`,
      password: this.config.cookieSecret,
      cookieOptions: {
        secure: this.config.cookieSecure,
        maxAge: 14 * 24 * 60 * 60,
      },
    };
  }

  protected async getLogtoUserFromRequest(session: IronSession, configs: GetContextParameters) {
    const nodeClient = this.createNodeClient(session);

    return nodeClient.getContext(configs);
  }
}
