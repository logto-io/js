import { discoveryPath } from '@logto/js';

const logtoStorageItemKeyPrefix = `logto`;
export const buildLogtoKey = (key: string): string => `${logtoStorageItemKeyPrefix}:${key}`;
export const buildRefreshTokenKey = (logtoKey: string) => `${logtoKey}:refreshToken`;
export const buildIdTokenKey = (logtoKey: string) => `${logtoKey}:idToken`;

export const buildAccessTokenKey = (resource = '', scopes: string[] = []): string =>
  `${scopes.slice().sort().join(' ')}@${resource}`;

export const getDiscoveryEndpoint = (endpoint: string): string =>
  new URL(discoveryPath, endpoint).toString();
