import type { UserInfoResponse } from '@logto/node';

import { LogtoStateKey } from '../utils/constants';

import { shallowRef as shallowReference, useNuxtApp, useState } from '#imports';

export default function useLogtoUser() {
  const nuxtApp = useNuxtApp();
  const user = useState<UserInfoResponse | undefined>(LogtoStateKey.User, () =>
    shallowReference(nuxtApp.ssrContext?.event.context.logtoUser)
  );
  return user.value;
}
