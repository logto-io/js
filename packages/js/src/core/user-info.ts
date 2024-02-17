import { type IdTokenClaims } from '../index.js';
import type { Requester } from '../types/index.js';

type Identity = {
  userId: string;
  details?: Record<string, unknown>;
};

export type UserInfoResponse = IdTokenClaims & {
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
