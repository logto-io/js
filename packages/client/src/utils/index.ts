import { discoveryPath } from '@logto/js';
import { appendPath, conditionalString } from '@silverhand/essentials';

export * from './requester.js';

export const buildAccessTokenKey = (
  resource = '',
  organizationId?: string,
  scopes: string[] = []
): string =>
  `${scopes.slice().sort().join(' ')}@${resource}${conditionalString(
    organizationId && `#${organizationId}`
  )}`;

export const getDiscoveryEndpoint = (endpoint: string): string =>
  appendPath(new URL(endpoint), discoveryPath).toString();
