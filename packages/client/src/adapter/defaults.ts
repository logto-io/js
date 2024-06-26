import { LogtoError } from '@logto/js';
import type { JWTVerifyGetKey } from 'jose';
import { jwtVerify, createRemoteJWKSet } from 'jose';

import { type StandardLogtoClient } from '../client.js';

import { type JwtVerifier } from './types.js';

export const defaultClockTolerance = 300; // 5 minutes

export const verifyIdToken = async (
  idToken: string,
  clientId: string,
  issuer: string,
  jwks: JWTVerifyGetKey,
  clockTolerance = defaultClockTolerance
) => {
  const result = await jwtVerify(idToken, jwks, { audience: clientId, issuer, clockTolerance });

  if (Math.abs((result.payload.iat ?? 0) - Date.now() / 1000) > clockTolerance) {
    throw new LogtoError('id_token.invalid_iat');
  }
};

export class DefaultJwtVerifier implements JwtVerifier {
  protected getJwtVerifyGetKey?: JWTVerifyGetKey;

  constructor(
    protected client: StandardLogtoClient,
    public readonly clockTolerance = defaultClockTolerance
  ) {}

  async verifyIdToken(idToken: string): Promise<void> {
    const { appId } = this.client.logtoConfig;
    const { issuer, jwksUri } = await this.client.getOidcConfig();

    this.getJwtVerifyGetKey ||= createRemoteJWKSet(new URL(jwksUri));

    await verifyIdToken(idToken, appId, issuer, this.getJwtVerifyGetKey, this.clockTolerance);
  }
}
