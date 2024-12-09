import { useState, useNuxtApp } from '#app';
import type { UserInfoResponse } from '@logto/node';
import { shallowRef } from 'vue';

import { LogtoStateKey } from '../utils/constants';

/**
 * Get the Logto user information. If the user is not signed in, this composable will return
 * `undefined`.
 *
 * Note: This composable relies on the SSR context which is filled by the Logto event handler. Once
 * the user is signed in, the user information will be available in both the server and client side.
 *
 * @returns The user information if the user is signed in, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const user = useLogtoUser();
 *
 * if (user) {
 *   console.log('User is signed in:', user); // { sub: '123', ... }
 * }
 * ```
 */
export default function useLogtoUser() {
  const nuxtApp = useNuxtApp();
  const user = useState<UserInfoResponse | undefined>(LogtoStateKey.User, () =>
    shallowRef(nuxtApp.ssrContext?.event.context.logtoUser)
  );
  return user.value;
}
