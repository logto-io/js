import { useNuxtApp } from '#app';
import type LogtoClient from '@logto/node';

/**
 * Get the Logto client instance in the current context. Returns `undefined` if the client is not
 * available.
 *
 * Note: This composable only works in the server side and relies on the SSR context which is
 * filled by the Logto event handler.
 *
 * @returns The Logto client instance if available, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const client = useLogtoClient();
 *
 * if (client) {
 *   const token = await client.getAccessToken();
 * }
 * ```
 */
export default function useLogtoClient(): LogtoClient | undefined {
  const nuxtApp = useNuxtApp();
  const client: unknown = nuxtApp.ssrContext?.event.context.logtoClient;
  // eslint-disable-next-line no-restricted-syntax -- `instanceof` doesn't work here (returns false)
  return client as LogtoClient | undefined;
}
