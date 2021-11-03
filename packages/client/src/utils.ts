import { z, ZodError } from 'zod';

import { DEFAULT_SCOPE_VALUES } from './constants';

const fullfillBase64 = (input: string) => {
  if (input.length === 2) {
    return `${input}==`;
  }

  if (input.length === 3) {
    return `${input}=`;
  }

  return input;
};

const IDTokenSchema = z.object({
  iss: z.string(),
  sub: z.string(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  at_hash: z.optional(z.string()),
});

export type IDToken = z.infer<typeof IDTokenSchema>;

/**
 * Decode IDToken from JWT, without verifying.
 * Verifying JWT requires fetching public key first, this can not
 * be done in a sync function, in some cases, verifying is not necessary.
 * @param token JWT string.
 * @returns IDToken combined with JWT Claims.
 */
export const decodeToken = (token: string): IDToken => {
  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    throw new Error('invalid token');
  }

  const payloadString = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    escape(Buffer.from(fullfillBase64(payloadString), 'base64').toString())
  );

  try {
    return IDTokenSchema.parse(JSON.parse(json));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw error;
    }

    throw new Error('invalid token: JSON parse failed');
  }
};

export const nowRoundToSec = () => Math.floor(Date.now() / 1000);

export const encodeBase64 = (input: string) => btoa(input);
export const decodeBase64 = (input: string) => atob(input);

/**
 * @param originalScope
 * @return customScope including all default scope values ( Logto requires `openid` and `offline_access` )
 */
export const generateScope = (originalScope?: string | string[]): string => {
  const originalScopeValues =
    originalScope === undefined
      ? []
      : Array.isArray(originalScope)
      ? originalScope
      : originalScope.split(' ');
  const nonEmptyScopeValues = originalScopeValues.map((s) => s.trim()).filter((s) => s.length > 0);
  const uniqueScopeValues = new Set([...DEFAULT_SCOPE_VALUES, ...nonEmptyScopeValues]);
  return Array.from(uniqueScopeValues).join(' ');
};
