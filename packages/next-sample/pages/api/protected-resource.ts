import { logtoClient } from '../../libraries/logto';

export default logtoClient.withLogtoApiRoute(async (request, response) => {
  if (!request.user.isAuthenticated) {
    response.status(401).json({ message: 'Unauthorized' });

    return;
  }

  // Get an access token with the target resource
  const accessToken = await logtoClient.getAccessToken(request, response, 'resource-indicator');
  // Do something with the access token
  console.log(accessToken);

  response.json({
    data: 'this_is_protected_resource',
  });
});
