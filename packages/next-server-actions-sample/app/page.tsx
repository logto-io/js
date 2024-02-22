import { getLogtoContext, getOrganizationTokens, signIn, signOut } from '@logto/next/server-actions';
import SignIn from './sign-in';
import SignOut from './sign-out';
import { logtoConfig } from './logto';

export default async function Home() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
  // If you need access token, pass the getAccessToken option.
  // and you can pass the access token to other API server or pass down to a client component.
  // const { isAuthenticated, claims, accessToken } = await getLogtoContext({ getAccessToken: true });
  // console.log(accessToken);
  const organizations = await getOrganizationTokens(logtoConfig);

  return (
    <main>
      <h1>Hello Logto.</h1>
      <div>
        {isAuthenticated ? (
          <SignOut
            onSignOut={async () => {
              'use server';

              await signOut(logtoConfig);
            }}
          />
        ) : (
          <SignIn
            onSignIn={async () => {
              'use server';

              await signIn(logtoConfig);
            }}
          />
        )}
      </div>
      {claims && (
        <div>
          <h2>Claims:</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(claims).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {organizations.length > 0 ? (
        <div>
          <h2>Organizations</h2>
          <ul>
            {organizations.map((organization) => (
              <li key={organization.id}>{organization.id}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
