import { defineEventHandler } from 'h3';
import { useNitroApp } from 'nitropack/runtime';

import { useRuntimeConfig } from '#imports';

import { logtoEventHandler } from '../utils/handler';
import type { AuthRouteSignInOptions } from '../utils/types';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  await logtoEventHandler(event, config, async (signInEvent) => {
    const signInOptions: AuthRouteSignInOptions = {};

    await useNitroApp().hooks.callHook('logto:sign-in-options', {
      event: signInEvent,
      signInOptions,
    });

    return signInOptions;
  });
});
