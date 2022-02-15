import { discoveryPath } from '@logto/js';

const logtoStorageItemKeyPrefix = `logto`;
export const getLogtoKey = (key: string): string => `${logtoStorageItemKeyPrefix}:${key}`;

export const getDiscoveryEndpoint = (endpoint: string): string =>
  new URL(discoveryPath, endpoint).toString();

export const buildAccessTokenKey = (resource = '', scopes: string[] = []): string =>
  `${scopes.slice().sort().join(' ')}@${resource}`;
