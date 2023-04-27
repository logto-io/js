import { getUser } from './api/logto/user/get-user';
import Nav from './nav';

const Page = async () => {
  const user = await getUser();

  return (
    <div>
      <header>
        <h1>Hello Logto.</h1>
      </header>
      <Nav isAuthenticated={user.isAuthenticated} />
      {user.isAuthenticated && user.claims && (
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
              {Object.entries(user.claims).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
