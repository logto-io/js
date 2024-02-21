import LogtoClient from '@logto/node';

import { useNuxtApp } from '#app';

export default function useLogtoClient(): LogtoClient | undefined {
  const nuxtApp = useNuxtApp();
  const client: unknown = nuxtApp.ssrContext?.event.context.logtoClient;
  return client instanceof LogtoClient ? client : undefined;
}
