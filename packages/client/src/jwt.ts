import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import createJwksClient, { JwksClient } from 'jwks-rsa';
import { IDToken } from './types.d';

let jwksClient: JwksClient;

export interface JWK {
  kty: string;
  use: string;
  kid: string;
  e: string;
  n: string;
}

export const fetchJwks = async (url: string): Promise<JWK[]> => {
  try {
    const { data } = await axios.get<{ keys: JWK[] }>(url);
    return data.keys;
  } catch (error: unknown) {
    console.error(error);
    throw new Error('Error occurred during jwks fetching');
  }
};

export const decode = (token: string) => {
  const { payload } = jwt.decode(token, { complete: true });
  const { iss, sub, aud, exp, iat, at_hash } = payload;

  // Check exp manually
  const now = new Date(Date.now());
  const expDate = new Date(0);
  expDate.setUTCSeconds(exp);
  if (now > expDate) {
    throw new Error(
      `Expiration Time (exp) claim error in the ID token; current time (${now.toISOString()}) is after expiration time (${expDate.toISOString()})`
    );
  }

  if (!iss) {
    throw new Error('Issuer (iss) claim must be a string present in the ID token');
  }

  if (!sub) {
    throw new Error('Subject (sub) claim must be a string present in the ID token');
  }

  if (!aud) {
    throw new Error(
      'Audience (aud) claim must be a string or any array of strings present in the ID token'
    );
  }

  if (typeof at_hash !== 'string') {
    throw new TypeError(
      'Access Token Hash (at_hash) claim must be a string present in the ID token'
    );
  }

  const idToken: IDToken = {
    iss,
    sub,
    aud,
    exp,
    iat,
    at_hash,
  };

  return idToken;
};

export interface JWTVerifyOptions {
  token: string;
  jwksUri: string;
  audience?: string | string[];
  issuer?: string;
  subject?: string;
}

export const verify = async ({ token, jwksUri, audience, issuer, subject }: JWTVerifyOptions) => {
  if (!jwksClient) {
    jwksClient = createJwksClient({ jwksUri });
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      (header, callback) => {
        jwksClient.getSigningKey(header.kid, (error, key) => {
          if (error) {
            callback(error);
          } else if ('publicKey' in key) {
            callback(null, key.publicKey);
          } else if ('rsaPublicKey' in key) {
            callback(null, key.rsaPublicKey);
          } else {
            callback(new Error('error finding signing key'));
          }
        });
      },
      { audience, issuer, subject },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};
