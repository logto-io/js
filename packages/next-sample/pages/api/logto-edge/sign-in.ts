import { config as logtoConfig } from '../../../libraries/config';
import { logtoClient } from '../../../libraries/logto-edge';

export default logtoClient.handleSignIn(`${logtoConfig.baseUrl}/api/logto-edge/sign-in-callback`);

export const config = {
  runtime: 'edge',
};
