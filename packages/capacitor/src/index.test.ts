import { Browser } from '@capacitor/browser';

import CapacitorLogtoClient from './index.js';

jest.mock('@capacitor/browser', () => ({
  Browser: {
    open: jest.fn(),
  },
}));

class CapacitorLogtoClientTest extends CapacitorLogtoClient {
  getAdapter() {
    return this.adapter;
  }
}
const createClient = () =>
  new CapacitorLogtoClientTest({
    endpoint: 'https://your.logto.endpoint',
    appId: 'your-app-id',
  });

describe('CapacitorLogtoClient', () => {
  it('should override navigate', async () => {
    const client = createClient();
    expect(client.getAdapter().navigate).toBeDefined();
    await client.getAdapter().navigate('https://example.com');

    const spy = jest.spyOn(Browser, 'open');
    expect(spy).toHaveBeenCalledWith({
      url: 'https://example.com',
      windowName: '_self',
      presentationStyle: 'popover',
    });
  });
});
