import LogtoClient from '@logto/next';

import { config } from './config';

export const logtoClient = new LogtoClient(config);
