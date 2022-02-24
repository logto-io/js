/* eslint-disable @silverhand/fp/no-mutation */
import { baseUrl, redirectUrl } from '../consts.js';

const Home = (app, logtoClient) => {
  if (!logtoClient) {
    throw new Error('no logto client found');
  }

  const { isAuthenticated } = logtoClient;
  const onClickSignIn = () => logtoClient.signIn(redirectUrl);
  const onClickSignOut = () => logtoClient.signOut(baseUrl);

  const fragment = document.createDocumentFragment();

  const container = document.createElement('div');
  container.classList.add('container');

  const h3 = document.createElement('h3');
  h3.innerHTML = 'Logto Browser Sample';

  const button = document.createElement('button');
  button.innerHTML = isAuthenticated ? 'Sign Out' : 'Sign In';
  button.addEventListener('click', isAuthenticated ? onClickSignOut : onClickSignIn);

  container.append(h3, button);

  if (isAuthenticated) {
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
    const entries = Object.entries(logtoClient.getIdTokenClaims());
    for (const [key, value] of entries) {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      const tdValue = document.createElement('td');
      tdName.innerHTML = key;
      tdValue.innerHTML = value;
      tr.append(tdName, tdValue);
      tbody.append(tr);
    }

    table.append(tbody);
    container.append(table);
  }

  fragment.append(container);
  app.append(fragment);
};

export default Home;
/* eslint-enable @silverhand/fp/no-mutation */
