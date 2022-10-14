import { createSession } from '@remix-run/node';

import { makeLogtoClient } from './create-client';
import type { LogtoConfig } from './create-client';
import { createStorage } from './create-storage';

const config: LogtoConfig = {
  appId: 'app_id_value',
  endpoint: 'https://logto.dev',
};

describe('infrastructure:logto:createClient', () => {
  it('creates an instance without crash', () => {
    expect(() => {
      const storage = createStorage(createSession());

      const createLogtoClient = makeLogtoClient(config, storage);

      createLogtoClient();
    }).not.toThrow();
  });
});
