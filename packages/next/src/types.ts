import type { LogtoConfig } from '@logto/node';
import type NodeClient from '@logto/node';
import { type NextApiRequest, type NextApiResponse } from 'next';

export type LogtoNextConfig = LogtoConfig & {
  cookieSecret: string;
  cookieSecure: boolean;
  baseUrl: string;
};

export type Adapters = {
  NodeClient: typeof NodeClient;
};

export type ErrorHandler = (
  request: NextApiRequest,
  response: NextApiResponse,
  error: unknown
) => unknown;
