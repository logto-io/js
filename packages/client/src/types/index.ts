import type { Prompt } from '@logto/js';
import { isArbitraryObject } from '@logto/js';

export type LogtoConfig = {
  endpoint: string;
  appId: string;
  appSecret?: string;
  scopes?: string[];
  resources?: string[];
  prompt?: Prompt;
};

export type AccessToken = {
  token: string;
  scope: string;
  expiresAt: number;
};

export const isLogtoSignInSessionItem = (data: unknown): data is LogtoSignInSessionItem => {
  if (!isArbitraryObject(data)) {
    return false;
  }

  return ['redirectUri', 'codeVerifier', 'state'].every((key) => typeof data[key] === 'string');
};

export const isLogtoAccessTokenMap = (data: unknown): data is Record<string, AccessToken> => {
  if (!isArbitraryObject(data)) {
    return false;
  }

  return Object.values(data).every((value) => {
    if (!isArbitraryObject(value)) {
      return false;
    }

    return (
      typeof value.token === 'string' &&
      typeof value.scope === 'string' &&
      typeof value.expiresAt === 'number'
    );
  });
};

export type LogtoSignInSessionItem = {
  redirectUri: string;
  codeVerifier: string;
  state: string;
};
