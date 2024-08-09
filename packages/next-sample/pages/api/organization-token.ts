import { logtoClient } from '../../libraries/logto';

export default logtoClient.withLogtoApiRoute(async (request, response) => {
  if (!request.user.isAuthenticated) {
    response.status(401).json({ message: 'Unauthorized' });

    return;
  }

  const organizationToken = await logtoClient.getOrganizationToken(
    request,
    response,
    'organization_id'
  );

  // Do something with the organization token
  console.log(organizationToken);

  response.end();
});
