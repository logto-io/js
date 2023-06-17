import { isObject } from '@silverhand/essentials';
import { createLocalJWKSet, type JSONWebKeySet, type JWTVerifyGetKey } from 'jose';

import { type ClientAdapterInstance } from './adapter/index.js';
import { CacheKey } from './adapter/types.js';

// Edited from jose's internal util `isJWKSLike`
function isJwkSetLike(jwkSet: unknown): jwkSet is JSONWebKeySet {
  return Boolean(
    jwkSet &&
      typeof jwkSet === 'object' &&
      'keys' in jwkSet &&
      Array.isArray(jwkSet.keys) &&
      jwkSet.keys.every((element) => isObject(element))
  );
}

export class CachedRemoteJwkSet {
  protected jwkSet?: JSONWebKeySet;

  constructor(public readonly url: URL, private readonly adapter: ClientAdapterInstance) {
    if (!adapter.unstable_cache) {
      throw new Error(
        "No cache found in the client adapter. Use `createRemoteJWKSet()` from 'jose' instead."
      );
    }
  }

  async getKey(...args: Parameters<JWTVerifyGetKey>) {
    if (!this.jwkSet) {
      this.jwkSet = await this.#load();
    }

    try {
      return await this.#getLocalKey(...args);
    } catch (error: unknown) {
      // Jose does not export the error definition
      // Found in https://github.com/panva/jose/blob/d5b3cb672736112b1e1e31ac4d5e9cd641675206/src/util/errors.ts#L347
      if (error instanceof Error && 'code' in error && error.code === 'ERR_JWKS_NO_MATCHING_KEY') {
        this.jwkSet = await this.#load();
        return this.#getLocalKey(...args);
      }

      throw error;
    }
  }

  async #load(): Promise<JSONWebKeySet> {
    return this.adapter.getWithCache(CacheKey.Jwks, async () => {
      const controller = new AbortController();
      const response = await fetch(this.url, { signal: controller.signal, redirect: 'manual' });

      if (!response.ok) {
        throw new Error('Expected OK from the JSON Web Key Set HTTP response');
      }

      const json = await response.json();

      if (!isJwkSetLike(json)) {
        throw new Error('JSON Web Key Set malformed');
      }

      return json;
    });
  }

  async #getLocalKey(...args: Parameters<JWTVerifyGetKey>) {
    if (!this.jwkSet) {
      throw new Error('No local JWK Set found.');
    }
    return createLocalJWKSet(this.jwkSet)(...args);
  }
}
