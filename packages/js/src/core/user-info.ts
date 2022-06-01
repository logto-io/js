import { Requester } from '../utils';

export type UserInfoResponse = {
  sub: string;
  name?: string;
  username?: string;
  avatar?: string;
  role_names?: string[];
};

export const fetchUserInfo = async (
  userInfoEndpoint: string,
  accessToken: string,
  requester: Requester
): Promise<UserInfoResponse> =>
  requester<UserInfoResponse>(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
