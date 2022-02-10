import { createRequester } from '@logto/js';

import LogtoClient from './index';

describe('LogtoClient', () => {
  test('constructor', () => {
    expect(
      () =>
        new LogtoClient({
          endpoint: 'https://logto.dev',
          clientId: 'client_id_value',
          usingPersistStorage: false,
          requester: createRequester(),
        })
    ).not.toThrow();
  });
});
