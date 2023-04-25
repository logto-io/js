import { logtoClient } from '../../libraries/logto-edge';

export default logtoClient.withLogtoApiRoute((request, response) => {
  if (!request.user.isAuthenticated) {
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
});

export const config = {
  runtime: 'experimental-edge',
};
