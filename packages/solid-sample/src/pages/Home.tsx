import { useLogto, type UserInfoResponse } from '@logto/solid';
import { createSignal, Show } from "solid-js";
import { baseUrl, redirectUrl } from '../consts';

const Home = () => {
  const {isAuthenticated, signIn, signOut, fetchUserInfo} = useLogto();
  const [user, setUser] = createSignal<UserInfoResponse>();

  (async () => {
    if (isAuthenticated()) {
      const userInfo = await fetchUserInfo();
      setUser(userInfo);
    }
  })();

  return (
    <div>
      <h3>Logto Solid sample</h3>
      <Show when={!isAuthenticated()}>
        <button
          type="button"
          onClick={() => {
            void signIn(redirectUrl);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            void signIn(redirectUrl, 'signUp');
          }}
        >
          Sign up
        </button>
      </Show>
      <Show when={isAuthenticated()}>
        <button
          type="button"
          onClick={() => {
            void signOut(baseUrl);
          }}
        >
          Sign out
        </button>
      </Show>
      <Show when={isAuthenticated() && user()}>
        <table>
          <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
          </thead>
          <tbody>
          {Object.entries(user()).map(([key, value]) => (
            <tr>
              <td>{key}</td>
              <td>{typeof value === 'string' ? value : JSON.stringify(value)}</td>
            </tr>
          ))}
          </tbody>
        </table>
        <ul>
          <li>
            <a href="/protected">View protected resource</a>
          </li>
          <li>
            <a href="/protected/organizations">View organizations</a>
          </li>
        </ul>
      </Show>
    </div>
  );
};

export default Home;
