import { defineEventHandler } from 'h3';

import { useRuntimeConfig } from '#imports';

import { logtoEventHandler } from '../utils/handler';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  await logtoEventHandler(event, config);
});
