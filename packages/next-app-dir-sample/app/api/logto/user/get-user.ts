import { type LogtoContext } from '@logto/next';
import { cookies } from 'next/headers';

// `server-only` guarantees any modules that import code in file
// will never run on the client. Even though this particular api
// doesn't currently use sensitive environment variables, it's
// good practise to add `server-only` preemptively.
// eslint-disable-next-line import/no-unassigned-import
import 'server-only';
import { config } from '../../../../libraries/config';

export async function getUser() {
  const response = await fetch(`${config.baseUrl}/api/logto/user`, {
    cache: 'no-store',
    headers: {
      cookie: cookies().toString(),
    },
  });

  if (!response.ok) {
    throw new Error('Something went wrong!');
  }

  // eslint-disable-next-line no-restricted-syntax
  const user = (await response.json()) as LogtoContext;

  return user;
}
