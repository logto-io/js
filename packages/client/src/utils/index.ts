import { discoveryPath } from '@logto/js';
import { decodeJwt } from 'jose';

export * from './requester';

export const buildAccessTokenKey = (resource = '', scopes: string[] = []): string =>
  `${scopes.slice().sort().join(' ')}@${resource}`;

export const decodeResourceFromAccessToken = (accessToken: string): string => {
  try {
    const audience = decodeJwt(accessToken).aud ?? '';
    const [resource = ''] = typeof audience === 'string' ? [audience] : audience;

    return resource;
  } catch {
    return '';
  }
};

export const getDiscoveryEndpoint = (endpoint: string): string =>
  new URL(discoveryPath, endpoint).toString();
