/* eslint-disable @silverhand/fp/no-mutation */
import { baseUrl, redirectUrl } from '../consts';

const Home = async (app, logtoClient) => {
  if (!logtoClient) {
    throw new Error('no logto client found');
  }

  // eslint-disable-next-line @silverhand/fp/no-let
  let isAuthenticated = false;
  const onClickSignIn = () => logtoClient.signIn(redirectUrl);
  const onClickSignOut = () => logtoClient.signOut(baseUrl);

  (async () => {
    isAuthenticated = await logtoClient.isAuthenticated();
    renderButton(container, { isAuthenticated, onClickSignIn, onClickSignOut });

    if (isAuthenticated) {
      const userInfo = await logtoClient.fetchUserInfo();
      renderTable(container, { userInfo });
    }
  })();

  const fragment = document.createDocumentFragment();

  const container = document.createElement('div');
  container.classList.add('container');

  const h3 = document.createElement('h3');
  h3.innerHTML = 'Logto Browser Sample';

  container.append(h3);
  renderButton(container, { isAuthenticated, onClickSignIn, onClickSignOut });

  fragment.append(container);
  app.append(fragment);
};

const renderButton = (container, states) => {
  const { isAuthenticated, onClickSignIn, onClickSignOut } = states;

  const rendered = document.querySelector('#button');
  const button = rendered ?? document.createElement('button');
  button.id = 'button';
  button.innerHTML = isAuthenticated ? 'Sign Out' : 'Sign In';
  button.addEventListener('click', isAuthenticated ? onClickSignOut : onClickSignIn);

  if (!rendered) {
    container.append(button);
  }
};

const renderTable = (container, states) => {
  const { userInfo } = states;

  // Generate display table for ID token claims
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  const thName = document.createElement('th');
  const thValue = document.createElement('th');
  thName.innerHTML = 'Name';
  thValue.innerHTML = 'Value';
  tr.append(thName, thValue);
  thead.append(tr);
  table.append(thead);

  const tbody = document.createElement('tbody');
  for (const [key, value] of Object.entries(userInfo)) {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    const tdValue = document.createElement('td');
    tdName.innerHTML = key;
    tdValue.innerHTML = typeof value === 'string' ? value : JSON.stringify(value);
    tr.append(tdName, tdValue);
    tbody.append(tr);
  }

  table.append(tbody);
  container.append(table);
};

export default Home;
/* eslint-enable @silverhand/fp/no-mutation */
