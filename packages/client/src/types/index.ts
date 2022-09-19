import { Prompt } from '@logto/js';
import { Infer, number, record, string, type } from 'superstruct';

export type LogtoConfig = {
  endpoint: string;
  appId: string;
  appSecret?: string;
  scopes?: string[];
  resources?: string[];
  prompt?: Prompt;
};

export const AccessTokenSchema = type({
  token: string(),
  scope: string(),
  expiresAt: number(),
});

export type AccessToken = Infer<typeof AccessTokenSchema>;

export const LogtoSignInSessionItemSchema = type({
  redirectUri: string(),
  codeVerifier: string(),
  state: string(),
});

export const LogtoAccessTokenMapSchema = record(string(), AccessTokenSchema);

export type LogtoSignInSessionItem = Infer<typeof LogtoSignInSessionItemSchema>;
