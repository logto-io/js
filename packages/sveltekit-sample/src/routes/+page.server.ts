import type { Actions } from './$types';

export const actions: Actions = {
  signIn: async ({ locals }) => {
    await locals.logtoClient.signIn('http://localhost:5173/callback');

    // Or use the following code to redirect after the callback is done.
    // await locals.logtoClient.signIn({
    //   redirectUri: 'http://localhost:5173/callback',
    //   postRedirectUri: 'http://localhost:5173/some-path',
    // });
  },
  signOut: async ({ locals }) => {
    await locals.logtoClient.signOut('http://localhost:5173/');
  },
};
