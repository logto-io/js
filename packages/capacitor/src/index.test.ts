import { Browser } from '@capacitor/browser';

import CapacitorLogtoClient from './index.js';

vi.mock('@capacitor/browser', () => ({
  Browser: {
    open: vi.fn(),
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
    await client.getAdapter().navigate('https://example.com', { for: 'sign-in' });

    expect(Browser.open).toHaveBeenCalledWith({
      url: 'https://example.com',
      windowName: '_self',
      presentationStyle: 'popover',
    });
  });
});
