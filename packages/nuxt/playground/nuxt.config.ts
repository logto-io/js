import { createResolver } from '@nuxt/kit';

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
});
