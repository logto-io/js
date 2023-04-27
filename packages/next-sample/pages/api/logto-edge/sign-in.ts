import { logtoClient } from '../../../libraries/logto-edge';

export default logtoClient.handleSignIn();

export const config = {
  runtime: 'experimental-edge',
};
