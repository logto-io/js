import { auth } from '../auth';
import SignIn from './components/sign-in';
import SignOut from './components/sign-out';

export default async function Home() {
  const session = await auth();

  return (
    <main>
      {session?.user ? <SignOut /> : <SignIn />}
      {session?.user && (
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
              {Object.entries(session.user).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
