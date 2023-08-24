import { logtoClient } from '../../../libraries/logto-edge';

export default logtoClient.handleUser({ fetchUserInfo: true });

export const config = {
  runtime: 'edge',
};
