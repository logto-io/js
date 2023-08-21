import { logtoClient } from '../../../libraries/logto-edge';

export default logtoClient.handleSignInCallback();

export const config = {
  runtime: 'edge',
};
