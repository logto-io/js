import { logtoClient } from '../../libraries/logto';

export default logtoClient.withLogtoApiRoute(
  (request, response) => {
    if (!request.user.isAuthenticated) {
      response.status(401).json({ message: 'Unauthorized' });

      return;
    }

    // Get an access token with the target resource
    console.log(request.user.accessToken);

    response.json({
      data: 'this_is_protected_resource',
    });
  },
  {
    // (Optional) getAccessToken: true,
    // (Optional) resource: 'https://the-resource.domain/'
  }
);
