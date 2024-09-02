import { type CookieStorage } from '@logto/node';

import type { Adapters, LogtoNextConfig } from './types';

export default class LogtoNextBaseClient {
  protected navigateUrl?: string;
  protected storage?: CookieStorage;
  constructor(
    protected readonly config: LogtoNextConfig,
    protected readonly adapters: Adapters
  ) {}
}
