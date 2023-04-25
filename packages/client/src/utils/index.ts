import { discoveryPath } from '@logto/js';

export * from './requester.js';

export const buildAccessTokenKey = (resource = '', scopes: string[] = []): string =>
  `${scopes.slice().sort().join(' ')}@${resource}`;

export const getDiscoveryEndpoint = (endpoint: string): string =>
  new URL(discoveryPath, endpoint).toString();
