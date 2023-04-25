import { ContentType, QueryKey } from '../consts/index.js';
import type { Requester } from '../types/index.js';

export const revoke = async (
  revocationEndpoint: string,
  clientId: string,
  token: string,
  requester: Requester
): Promise<void> =>
  requester<void>(revocationEndpoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: new URLSearchParams({
      [QueryKey.ClientId]: clientId,
      [QueryKey.Token]: token,
    }),
  });
