import { type Nullable } from '@silverhand/essentials';

import { type IdTokenClaims } from '../index.js';
import type { Requester } from '../types/index.js';

type Identity = {
  userId: string;
  details?: Record<string, unknown>;
};

type OrganizationData = {
  id: string;
  name: string;
  description: Nullable<string>;
};

export type UserInfoResponse = IdTokenClaims & {
  custom_data?: unknown;
  identities?: Record<string, Identity>;
  organization_data?: OrganizationData[];
};

export const fetchUserInfo = async (
  userInfoEndpoint: string,
  accessToken: string,
  requester: Requester
): Promise<UserInfoResponse> =>
  requester<UserInfoResponse>(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
