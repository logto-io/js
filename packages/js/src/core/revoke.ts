import { ContentType } from '../consts';
import { Requester } from '../utils';

export const revoke = async (
  revocationEndpoint: string,
  clientId: string,
  token: string,
  requester: Requester
): Promise<void> =>
  requester<void>(revocationEndpoint, {
    method: 'POST',
    headers: ContentType.formUrlEncoded,
    body: new URLSearchParams({ client_id: clientId, token }),
  });
