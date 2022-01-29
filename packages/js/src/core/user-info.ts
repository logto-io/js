import { createRequester } from '../utils/requester';

export type UserInfoResponse = {
  sub: string;
};

export const fetchUserInfo = async (
  userInfoEndpoint: string,
  accessToken: string,
  fetchFunction?: typeof fetch
): Promise<UserInfoResponse> => {
  const requester = createRequester(fetchFunction);

  return requester<UserInfoResponse>(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};
