import { Requester } from '../types';

type Identity = {
  userId: string;
  details?: Record<string, unknown>;
};

export type UserInfoResponse = {
  sub: string;
  name?: string;
  username?: string;
  picture?: string;
  role_names?: string[];
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  custom_data?: unknown;
  identities?: Record<string, Identity>;
};

export const fetchUserInfo = async (
  userInfoEndpoint: string,
  accessToken: string,
  requester: Requester
): Promise<UserInfoResponse> =>
  requester<UserInfoResponse>(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
