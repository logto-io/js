import { type NextRequest } from 'next/server';

import { logtoClient } from '../../libraries/logto-edge';

const handler = async (request: NextRequest) => {
  const context = await logtoClient.getLogtoContext(request);

  if (!context.isAuthenticated) {
    return new Response(
      JSON.stringify({
        message: 'Unauthorized',
      }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      data: 'Protected Resource in Edge API',
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
};

export default handler;

export const config = {
  runtime: 'edge',
};
