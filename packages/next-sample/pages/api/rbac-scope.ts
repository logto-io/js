import { logtoClient } from '../../libraries/logto';

export default logtoClient.withLogtoApiRoute(
  (request, response) => {
    if (!request.user.isAuthenticated) {
      response.status(401).json({ message: 'Unauthorized' });

      return;
    }

    if (!request.user.scopes?.includes('read:users')) {
      response.status(403).json({ message: 'Access denied, requires read:user scope.' });

      return;
    }

    response.json({
      data: 'this_is_resource_protected_by_rbac_scope',
    });
  },
  {
    getAccessToken: true,
    resource: 'http://localhost:3005',
  }
);
