import { getLogtoContext, getOrganizationTokens } from '../libraries/logto';
import SignIn from './sign-in';
import SignOut from './sign-out';

export default async function Home() {
  const { isAuthenticated, claims } = await getLogtoContext();
  const organizations = await getOrganizationTokens();

  return (
    <main>
      <h1>Hello Logto.</h1>
      <div>{isAuthenticated ? <SignOut /> : <SignIn />}</div>
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
