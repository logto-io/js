import type { IncomingMessage, ServerResponse } from 'http';

import type { IronSessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session/edge';
import type {
  NextApiHandler,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from 'next';

import getPropertyDescriptorForRequestSession from './get-property-descriptor-for-request-session';

// Argument types based on getIronSession function
type GetIronSessionApiOptions = (
  request: NextApiRequest,
  response: NextApiResponse
) => Promise<IronSessionOptions> | IronSessionOptions;

export function withIronSessionApiRoute(
  handler: NextApiHandler,
  options: IronSessionOptions | GetIronSessionApiOptions
): NextApiHandler {
  return async (request, response) => {
    const sessionOptions = options instanceof Function ? await options(request, response) : options;
    const session = await getIronSession(request, response, sessionOptions);

    // We define req.session as being enumerable (so console.log(req) shows it)
    // and we also want to allow people to do:
    // req.session = { admin: true }; or req.session = {...req.session, admin: true};
    // req.session.save();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(request, 'session', getPropertyDescriptorForRequestSession(session));

    return handler(request, response);
  };
}

// Argument type based on the SSR context
type GetIronSessionSsrOptions = (
  request: IncomingMessage,
  response: ServerResponse
) => Promise<IronSessionOptions> | IronSessionOptions;

export function withIronSessionSsr<P extends Record<string, unknown> = Record<string, unknown>>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
  options: IronSessionOptions | GetIronSessionSsrOptions
) {
  return async (context: GetServerSidePropsContext) => {
    const sessionOptions =
      options instanceof Function ? await options(context.req, context.res) : options;
    const session = await getIronSession(context.req, context.res, sessionOptions);

    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(context.req, 'session', getPropertyDescriptorForRequestSession(session));

    return handler(context);
  };
}
