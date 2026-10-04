import LogtoClient from '@logto/next/edge';

import { config } from './config';

export const logtoClient = new LogtoClient(config);
