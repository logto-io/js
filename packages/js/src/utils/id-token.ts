import * as s from 'superstruct';

const fullfillBase64 = (input: string) => {
  if (input.length === 2) {
    return `${input}==`;
  }

  if (input.length === 3) {
    return `${input}=`;
  }

  return input;
};

/**
 * @link [ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
const IdTokenClaimsSchema = s.type({
  iss: s.string(),
  sub: s.string(),
  aud: s.string(),
  exp: s.number(),
  iat: s.number(),
  at_hash: s.optional(s.string()),
});

export type IdTokenClaims = s.Infer<typeof IdTokenClaimsSchema>;

export const decodeIdToken = (token: string): IdTokenClaims => {
  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    throw new Error('invalid token');
  }

  const payloadString = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    escape(Buffer.from(fullfillBase64(payloadString), 'base64').toString())
  );

  try {
    // Use Superstruct to validate the json type
    const idToken = JSON.parse(json) as IdTokenClaims;
    s.assert(idToken, IdTokenClaimsSchema);
    return idToken;
  } catch (error: unknown) {
    if (error instanceof s.StructError) {
      throw error;
    }

    throw new Error('invalid token: JSON parse failed');
  }
};
