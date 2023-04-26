import type { Nullable } from '@silverhand/essentials';

import type { Requester } from '../types/index.js';

type Identity = {
  userId: string;
  details?: Record<string, unknown>;
};

export type UserInfoResponse = {
  sub: string;
  name?: Nullable<string>;
  username?: Nullable<string>;
  picture?: Nullable<string>;
  email?: Nullable<string>;
  email_verified?: boolean;
  phone_number?: Nullable<string>;
  phone_number_verified?: boolean;
  custom_data?: unknown; // Not null in DB.
  identities?: Record<string, Identity>; // Not null in DB.
};

export const fetchUserInfo = async (
  userInfoEndpoint: string,
  accessToken: string,
  requester: Requester
): Promise<UserInfoResponse> =>
  requester<UserInfoResponse>(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
