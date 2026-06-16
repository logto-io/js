import type { Adapters, LogtoNextConfig } from './types';

export default class LogtoNextBaseClient {
  constructor(
    protected readonly config: LogtoNextConfig,
    protected readonly adapters: Adapters
  ) {}
}
