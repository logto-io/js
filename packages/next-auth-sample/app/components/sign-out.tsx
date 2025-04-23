import { signOut } from '../../auth';
import { redirect } from 'next/navigation';

const generateSignOutUri = (postLogoutRedirectUri: string) => {
  if (!process.env.AUTH_LOGTO_ID) {
    throw new Error('AUTH_LOGTO_ID is not set');
  }

  const urlSearchParameters = new URLSearchParams({ 'client_id': process.env.AUTH_LOGTO_ID, 'post_logout_redirect_uri': postLogoutRedirectUri });

  return `${process.env.AUTH_LOGTO_ISSUER}/session/end?${urlSearchParameters.toString()}`;
};

export default function SignOut() {
  return (
    <form
      action={async () => {
        'use server';
        // Visit post-sign-out URL to implement federated sign-out,
        // @see https://authjs.dev/reference/core/adapters#federated-logout
        const { redirect: signOutRedirect } = await signOut({ redirect: false });
        redirect(generateSignOutUri(signOutRedirect));
        // If you don't need to implement federated sign-out, you can use the following code instead:
        // await signOut();
      }}
    >
      <button type="submit">
        Sign Out
      </button>
    </form>
  );
}
