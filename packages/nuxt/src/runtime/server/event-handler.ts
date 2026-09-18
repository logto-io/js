import { defineEventHandler } from 'h3';
import { useNitroApp } from 'nitropack/runtime';

import { useRuntimeConfig } from '#imports';

import { logtoEventHandler } from '../utils/handler';
import type { AuthRouteSignInOptions } from '../utils/types';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  /**
   * Nitro mounts this route-less handler as middleware, and h3 only serializes a middleware's
   * return value when the middleware returns one. Awaiting without returning would drop the
   * access token payload and let the request fall through to Nuxt's renderer.
   */
  return logtoEventHandler(event, config, async (signInEvent) => {
    const signInOptions: AuthRouteSignInOptions = {};

    await useNitroApp().hooks.callHook('logto:sign-in-options', {
      event: signInEvent,
      signInOptions,
    });

    return signInOptions;
  });
});
