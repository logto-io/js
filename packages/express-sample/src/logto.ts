import LogtoClient from '@logto/express';

export const logtoClient = new LogtoClient({
  appId: 'foo-traditional',
  appSecret: 'TXxxky90RxGNFeStfP2xv--ZhsPoz9VGRn5PDbEI1iAACGZp6R_IN0iigujq42V5',
  endpoint: 'https://logto.dev',
  baseUrl: 'http://localhost:3000',
});
