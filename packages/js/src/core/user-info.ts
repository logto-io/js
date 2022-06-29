import { Nullable } from '@silverhand/essentials';

import { Requester } from '../utils';

export type UserInfoResponse = {
  sub: string;
  name?: Nullable<string>;
  username?: Nullable<string>;
  avatar?: Nullable<string>;
  role_names?: Nullable<string[]>;
};

export const fetchUserInfo = async (
  userInfoEndpoint: string,
  accessToken: string,
  requester: Requester
): Promise<UserInfoResponse> =>
  requester<UserInfoResponse>(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
