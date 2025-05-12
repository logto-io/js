import { auth } from '../../auth';

// This is a sample page to fetch user info from Logto
export default async function FetchUserInfo() {
  const session = await auth();
  const response = await fetch(`${process.env.AUTH_LOGTO_ISSUER}/me`, {
    headers: {
      // @ts-expect-error
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });
  const user = await response.json();

  return <div>{JSON.stringify(user)}</div>;
}
