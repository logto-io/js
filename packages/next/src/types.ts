import type { LogtoConfig, SessionWrapper } from '@logto/node';
import type NodeClient from '@logto/node';
import { type NextApiRequest, type NextApiResponse } from 'next';

export type LogtoNextConfig = LogtoConfig & {
  cookieSecure: boolean;
  baseUrl: string;
  /**
   * Can be provided to use custom session wrapper,
   * for example, to use external storage solutions,
   * you can save the session data in external storage and return a key in the sessionWrapper.wrap method,
   * then use the key to get the session data from external storage in the sessionWrapper.unwrap method.
   */
  sessionWrapper?: SessionWrapper;
  cookieSecret?: string;
};

export type Adapters = {
  NodeClient: typeof NodeClient;
};

export type ErrorHandler = (
  request: NextApiRequest,
  response: NextApiResponse,
  error: unknown
) => unknown;
