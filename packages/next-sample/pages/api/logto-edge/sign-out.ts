import { logtoClient } from '../../../libraries/logto-edge';

export default logtoClient.handleSignOut();

export const config = {
  runtime: 'edge',
};
