import NextStorage from './storage';
import type { Adapters, LogtoNextConfig, Session } from './types';

export default class LogtoNextBaseClient {
  protected navigateUrl?: string;
  protected storage?: NextStorage;
  constructor(
    protected readonly config: LogtoNextConfig,
    protected readonly adapters: Adapters
  ) {}

  protected createNodeClient(session: Session) {
    this.storage = new NextStorage(session);

    return new this.adapters.NodeClient(this.config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url;
      },
    });
  }
}
