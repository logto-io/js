import { z, ZodError } from 'zod';

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
 * Decode IDToken from JWT, without verifing.
 * Verifing JWT requires fetching public key first, this can not
 * be done in a sync function, in some cases, verifing is not necessary.
 * @param token JWT string
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
    const payload = JSON.parse(json) as IDToken;

    return IDTokenSchema.parse(payload);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw error;
    }

    throw new Error('invalid token: JSON parse failed');
  }
};
